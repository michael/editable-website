import { MAX_VIDEO_RESOLUTION, VIDEO_BITRATE } from '$lib/config.js';

/**
 * @typedef {{
 *   blob: Blob,
 *   width: number,
 *   height: number,
 *   passthrough: boolean
 * }} ProcessedVideo
 *
 * @typedef {{
 *   onStatus?: (status: string) => void,
 *   onProgress?: (progress: number) => void
 * }} ProcessVideoOptions
 */

/**
 * Transcode a video file off the main thread using a Web Worker.
 * Produces a web-optimized MP4 (H.264 + AAC) capped at MAX_VIDEO_RESOLUTION.
 * Files that are already web-optimized are detected and passed through
 * (as-is for MP4, losslessly remuxed for other containers like MOV).
 *
 * @param {File} file - The original video file
 * @param {ProcessVideoOptions} [options]
 * @returns {Promise<ProcessedVideo>}
 */
export function process_video(file, options = {}) {
	const { onStatus, onProgress } = options;

	return new Promise((resolve, reject) => {
		const worker = new Worker(
			new URL('./video_processor.js', import.meta.url),
			{ type: 'module' }
		);

		worker.addEventListener('message', (e) => {
			const msg = e.data;

			if (msg.type === 'status') {
				onStatus?.(msg.status);
				return;
			}

			if (msg.type === 'progress') {
				onProgress?.(msg.progress);
				return;
			}

			if (msg.type === 'error') {
				worker.terminate();
				reject(new Error(msg.error));
				return;
			}

			if (msg.type === 'result') {
				worker.terminate();
				resolve({
					// Passthrough: the file is already a web-optimized MP4 —
					// upload the original bytes untouched.
					blob: msg.passthrough ? file : new Blob([msg.buffer], { type: 'video/mp4' }),
					width: msg.width,
					height: msg.height,
					passthrough: Boolean(msg.passthrough)
				});
			}
		});

		worker.addEventListener('error', (e) => {
			worker.terminate();
			reject(new Error(e.message || 'Worker error'));
		});

		worker.postMessage({
			type: 'process',
			file,
			max_resolution: MAX_VIDEO_RESOLUTION,
			video_bitrate: VIDEO_BITRATE
		});
	});
}
