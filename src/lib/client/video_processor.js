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
	canEncodeAudio
} from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';

/**
 * Tolerance factor applied to the bitrate budget when deciding whether a
 * video needs re-encoding. Re-encoding a file that is only marginally over
 * budget saves little space but always costs quality.
 */
const BITRATE_TOLERANCE = 1.25;

/**
 * @param {string} status
 */
function post_status(status) {
	self.postMessage({ type: 'status', status });
}

/**
 * Build resize options that cap the short side at max_resolution.
 * Only one dimension is passed so mediabunny deduces the other from the
 * aspect ratio — this avoids letterboxing and never upscales.
 *
 * @param {number} display_width
 * @param {number} display_height
 * @param {number} max_resolution
 * @returns {{ width?: number, height?: number }}
 */
function build_resize_options(display_width, display_height, max_resolution) {
	const short_side = Math.min(display_width, display_height);
	if (short_side <= max_resolution) return {};
	return display_width < display_height
		? { width: max_resolution }
		: { height: max_resolution };
}

/**
 * Read the display dimensions of the primary video track from a transcoded
 * buffer, so the reported dimensions exactly match the stored file.
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise<{ width: number, height: number } | null>}
 */
async function read_output_dimensions(buffer) {
	const output_input = new Input({ source: new BufferSource(buffer), formats: ALL_FORMATS });
	const track = await output_input.getPrimaryVideoTrack();
	if (!track) return null;
	const width = await track.getDisplayWidth();
	const height = await track.getDisplayHeight();
	return { width, height };
}

/**
 * Handle a transcode request from the main thread.
 *
 * @param {{ file: File, max_resolution: number, video_bitrate: number }} data
 */
async function handle_process(data) {
	const { file, max_resolution, video_bitrate } = data;

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
		const resize = build_resize_options(display_width, display_height, max_resolution);

		// Skip-if-already-good detection: an H.264 video within the resolution
		// cap and bitrate budget gains nothing from re-encoding.
		const codec = await video_track.getCodec();
		const duration = await input.computeDuration();
		const average_bitrate = duration > 0 ? (file.size * 8) / duration : Infinity;
		const already_good =
			codec === 'avc' &&
			Math.min(display_width, display_height) <= max_resolution &&
			average_bitrate <= video_bitrate * BITRATE_TOLERANCE;

		if (already_good) {
			const format = await input.getFormat();
			if (format instanceof Mp4InputFormat) {
				// Already a good MP4 — upload the original bytes untouched.
				post_status('Video already optimized');
				self.postMessage({
					type: 'result',
					passthrough: true,
					width: display_width,
					height: display_height
				});
				return;
			}
		}

		const target = new BufferTarget();
		const output = new Output({
			format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
			target
		});

		// For an already-good video in a non-MP4 container (e.g. an H.264 .mov),
		// omit codec/bitrate so mediabunny losslessly copies the tracks into the
		// MP4 container instead of re-encoding.
		/** @type {import('mediabunny').ConversionVideoOptions} */
		const video_options = already_good
			? resize
			: { ...resize, codec: 'avc', bitrate: video_bitrate };

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

		post_status('Done');
		self.postMessage({ type: 'result', buffer, width, height }, { transfer: [buffer] });
	} catch (err) {
		self.postMessage({
			type: 'error',
			error: err instanceof Error ? err.message : 'Video transcoding failed'
		});
	}
}

self.addEventListener('message', (e) => {
	if (e.data?.type === 'process') {
		handle_process(e.data);
	}
});
