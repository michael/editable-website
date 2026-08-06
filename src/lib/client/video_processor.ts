import {
	Input,
	Output,
	Conversion,
	ALL_FORMATS,
	BlobSource,
	BufferSource,
	BufferTarget,
	Mp4InputFormat,
	Mp4OutputFormat,
	VideoSampleSink,
	canEncodeAudio
} from 'mediabunny';
import { encode as encode_webp } from '@jsquash/webp';
import { registerAacEncoder } from '@mediabunny/aac-encoder';
import type { ConversionVideoOptions } from 'mediabunny';

/**
 * Tolerance factor applied to the size budget when deciding whether a video
 * needs re-encoding. Re-encoding a file that is only marginally over budget
 * saves little space but always costs quality.
 */
const FILESIZE_TOLERANCE = 1.25;

/**
 * Fraction of the size budget to aim for. Browser encoders treat bitrate as
 * a target, not a contract, so leave headroom for overshoot and container
 * overhead.
 */
const BUDGET_SAFETY = 0.92;

/** Estimated audio bitrate reserved from the size budget, in bits/second. */
const AUDIO_BITRATE_ESTIMATE = 128_000;

/**
 * Quality bounds for H.264, in bits per pixel per frame. Below the floor the
 * output looks blocky, so we step down the resolution ladder instead. Above
 * the ceiling extra bits stop visibly improving quality, so the bitrate is
 * clamped there even when the size budget would allow more.
 */
const MIN_BITS_PER_PIXEL = 0.07;
const MAX_BITS_PER_PIXEL = 0.15;

/** Short-side resolution ladder to step down for long videos. */
const RESOLUTION_LADDER = [2160, 1440, 1080, 720, 540, 360, 240];

/**
 * Absolute floor for the video bitrate, in bits/second. Keeps the encoder
 * functional for extremely long videos even when the resulting file must
 * exceed the size goal.
 */
const MIN_VIDEO_BITRATE = 100_000;
const POSTER_WEBP_QUALITY = 80;

function post_status(status: string) {
	self.postMessage({ type: 'status', status });
}

/**
 * Candidate short-side resolutions: the source resolution capped at
 * max_resolution (never upscale), then every ladder step below it,
 * largest first.
 */
function build_candidate_resolutions(source_short_side: number, max_resolution: number): number[] {
	const top = Math.min(source_short_side, max_resolution);
	const candidates = [top];
	for (const step of RESOLUTION_LADDER) {
		if (step < top) candidates.push(step);
	}
	return candidates;
}

/**
 * Pick the output resolution and bitrate for a transcode: the largest
 * candidate resolution whose bits-per-pixel at the available bitrate stays
 * above the quality floor. When even the smallest resolution can't stay
 * above the floor (very long videos), it is used anyway — the file size
 * goal wins and the quality tradeoff is left to the user.
 *
 * frame_rate is in frames per second, budget_bitrate in bits/second, and
 * max_resolution caps the short side.
 */
function choose_encoding(
	display_width: number,
	display_height: number,
	frame_rate: number,
	budget_bitrate: number,
	max_resolution: number
): { short_side: number; bitrate: number } {
	const source_short_side = Math.min(display_width, display_height);
	const aspect = Math.max(display_width, display_height) / source_short_side;
	const candidates = build_candidate_resolutions(source_short_side, max_resolution);

	let chosen = { short_side: candidates[candidates.length - 1], bitrate: MIN_VIDEO_BITRATE };
	for (const short_side of candidates) {
		const pixels = short_side * Math.round(short_side * aspect);
		const bitrate_ceiling = MAX_BITS_PER_PIXEL * pixels * frame_rate;
		const bitrate = Math.round(
			Math.max(Math.min(budget_bitrate, bitrate_ceiling), MIN_VIDEO_BITRATE)
		);
		chosen = { short_side, bitrate };
		const bits_per_pixel = bitrate / (pixels * frame_rate);
		if (bits_per_pixel >= MIN_BITS_PER_PIXEL) break;
	}
	return chosen;
}

/**
 * Build resize options for a target short side. Only one dimension is
 * passed so mediabunny deduces the other from the aspect ratio — this
 * avoids letterboxing and rounding mismatches.
 */
function build_resize_options(
	display_width: number,
	display_height: number,
	short_side: number
): { width?: number; height?: number } {
	if (Math.min(display_width, display_height) <= short_side) return {};
	return display_width < display_height ? { width: short_side } : { height: short_side };
}

/**
 * Read the display dimensions of the primary video track from a transcoded
 * buffer, so the reported dimensions exactly match the stored file.
 */
async function read_output_dimensions(
	buffer: ArrayBuffer
): Promise<{ width: number; height: number } | null> {
	const output_input = new Input({ source: new BufferSource(buffer), formats: ALL_FORMATS });
	const track = await output_input.getPrimaryVideoTrack();
	if (!track) return null;
	const width = await track.getDisplayWidth();
	const height = await track.getDisplayHeight();
	return { width, height };
}

/**
 * Decode the first available video frame and encode it as the video's poster.
 */
async function create_poster(source: Blob): Promise<ArrayBuffer> {
	const input = new Input({ source: new BlobSource(source), formats: ALL_FORMATS });
	const video_track = await input.getPrimaryVideoTrack();
	if (!video_track || !(await video_track.canDecode())) {
		throw new Error('Could not decode a video frame for the poster.');
	}

	const sink = new VideoSampleSink(video_track);
	const first_frame = await sink.samples().next();
	const sample = first_frame.value;
	if (first_frame.done || !sample) {
		throw new Error('Could not decode a video frame for the poster.');
	}

	const canvas = new OffscreenCanvas(sample.displayWidth, sample.displayHeight);
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Could not create a canvas for the video poster.');
	try {
		context.drawImage(sample.toCanvasImageSource(), 0, 0);
		return await encode_webp(context.getImageData(0, 0, canvas.width, canvas.height), {
			quality: POSTER_WEBP_QUALITY
		});
	} finally {
		sample.close();
	}
}

/**
 * Handle a transcode request from the main thread.
 */
async function handle_process(data: { file: File; max_resolution: number; max_filesize: number }) {
	const { file, max_resolution, max_filesize } = data;

	try {
		post_status('Analyzing video…');

		// Firefox has no native AAC encoder — register the polyfill so audio
		// tracks that need transcoding aren't discarded.
		if (!(await canEncodeAudio('aac'))) {
			registerAacEncoder();
		}

		const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });

		const video_track = await input.getPrimaryVideoTrack();
		if (!video_track) {
			throw new Error('No video track found in this file.');
		}
		if (!(await video_track.canDecode())) {
			throw new Error(
				'This video format cannot be decoded by your browser. Please upload an H.264 MP4 instead.'
			);
		}

		const display_width = await video_track.getDisplayWidth();
		const display_height = await video_track.getDisplayHeight();

		// Skip-if-already-good detection: an H.264 video within the resolution
		// cap and size budget gains nothing from re-encoding.
		const codec = await video_track.getCodec();
		const already_good =
			codec === 'avc' &&
			Math.min(display_width, display_height) <= max_resolution &&
			file.size <= max_filesize * FILESIZE_TOLERANCE;

		if (already_good) {
			const format = await input.getFormat();
			if (format instanceof Mp4InputFormat) {
				// Already a good MP4 — upload the original bytes untouched.
				post_status('Generating video poster…');
				const poster_buffer = await create_poster(file);
				self.postMessage(
					{
						type: 'result',
						passthrough: true,
						width: display_width,
						height: display_height,
						poster_buffer
					},
					{ transfer: [poster_buffer] }
				);
				return;
			}
		}

		// Derive the video bitrate from the size budget and duration, and pick
		// the largest resolution that stays above the quality floor at that
		// bitrate. An unknown duration leaves the budget unbounded, so the
		// bits-per-pixel ceiling alone decides the bitrate.
		const duration = await input.computeDuration();
		const stats = await video_track.computePacketStats(100);
		const frame_rate = stats.averagePacketRate > 0 ? stats.averagePacketRate : 30;
		const budget_bitrate =
			duration > 0
				? Math.max(((max_filesize * 8) / duration) * BUDGET_SAFETY - AUDIO_BITRATE_ESTIMATE, 0)
				: Infinity;
		const encoding = choose_encoding(
			display_width,
			display_height,
			frame_rate,
			budget_bitrate,
			max_resolution
		);
		const resize = build_resize_options(display_width, display_height, encoding.short_side);

		const target = new BufferTarget();
		const output = new Output({
			format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
			target
		});

		// For an already-good video in a non-MP4 container (e.g. an H.264 .mov),
		// omit codec/bitrate so mediabunny losslessly copies the tracks into the
		// MP4 container instead of re-encoding.
		const video_options: ConversionVideoOptions = already_good
			? {}
			: { ...resize, codec: 'avc', bitrate: encoding.bitrate };

		const conversion = await Conversion.init({
			input,
			output,
			video: video_options
		});

		if (!conversion.isValid) {
			const reasons = conversion.discardedTracks.map((t) => t.reason).join(', ');
			throw new Error(`Video cannot be converted in this browser (${reasons}).`);
		}

		// A discarded audio track would silently produce a video without sound —
		// treat that as a failure rather than uploading a broken file.
		const discarded_audio = conversion.discardedTracks.find(
			(t) => t.track.type === 'audio' && t.reason !== 'discarded_by_user'
		);
		if (discarded_audio) {
			throw new Error(
				`The audio track cannot be converted in this browser (${discarded_audio.reason}).`
			);
		}

		conversion.onProgress = (progress) => {
			self.postMessage({ type: 'progress', progress });
		};

		post_status(already_good ? 'Repackaging video…' : 'Transcoding video…');
		await conversion.execute();

		const buffer = target.buffer;
		if (!buffer) {
			throw new Error('Transcoding produced no output.');
		}

		post_status('Reading output metadata…');
		const dims = await read_output_dimensions(buffer);
		const width = dims?.width ?? display_width;
		const height = dims?.height ?? display_height;

		post_status('Generating video poster…');
		const poster_buffer = await create_poster(new Blob([buffer], { type: 'video/mp4' }));

		post_status('Done');
		self.postMessage(
			{ type: 'result', buffer, width, height, poster_buffer },
			{ transfer: [buffer, poster_buffer] }
		);
	} catch (err) {
		self.postMessage({
			type: 'error',
			error: err instanceof Error ? err.message : 'Video transcoding failed'
		});
	}
}

async function handle_poster(data: { file: File }) {
	try {
		post_status('Generating video poster…');
		const poster_buffer = await create_poster(data.file);
		self.postMessage({ type: 'poster', poster_buffer }, { transfer: [poster_buffer] });
	} catch (err) {
		self.postMessage({
			type: 'error',
			error: err instanceof Error ? err.message : 'Video poster generation failed'
		});
	}
}

self.addEventListener('message', (e) => {
	if (e.data?.type === 'process') {
		handle_process(e.data);
	} else if (e.data?.type === 'poster') {
		handle_poster(e.data);
	}
});
