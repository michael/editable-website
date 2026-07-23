/**
 * Universal asset constants — safe to import from client, server, and Web Workers.
 * No Node.js imports allowed in this file.
 */

/** Fixed set of variant widths for responsive images, sorted ascending. */
export const VARIANT_WIDTHS = [320, 640, 1024, 1536, 2048, 3072, 4096];

/** VARIANT_WIDTHS as a Set for O(1) lookups */
export const VARIANT_WIDTHS_SET = new Set(VARIANT_WIDTHS);

/** Maximum image width — derived from the largest variant width */
export const MAX_IMAGE_WIDTH = VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];

/**
 * Maximum video resolution for transcoded videos, as a cap on the short side
 * (e.g. 1080 means landscape 1920×1080 and portrait 1080×1920). Videos are
 * never upscaled, and long videos may be stored below this cap when needed
 * to stay within MAX_VIDEO_FILESIZE.
 */
export const MAX_VIDEO_RESOLUTION = 1080;

/**
 * Target maximum file size for transcoded videos. The video bitrate (and,
 * for long videos, the resolution) is chosen so the output lands within
 * this size. It is a goal, not a hard limit: browser encoders treat
 * bitrate as a target, so the result may overshoot by a few percent.
 */
export const MAX_VIDEO_FILESIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Maximum size of a video file we attempt to transcode in the browser.
 * The transcoded output is held in memory, so very large inputs are rejected.
 */
export const MAX_VIDEO_INPUT_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

/**
 * Filename convention that marks a video as already web-optimized.
 * Matching MP4 files are uploaded as-is, skipping the transcode
 * (e.g. my_video_optimized.mp4, clip.optimized.mp4).
 */
export const OPTIMIZED_VIDEO_REGEX = /[._-]optimized\./i;

/** URL prefix for serving assets */
export const ASSET_BASE = '/assets';

/** Assets are content-addressed: {sha256}.{ext}. Everything else is rejected. */
export const ASSET_ID_REGEX = /^[a-f0-9]{64}\.[a-z0-9]+$/;

/**
 * MIME types accepted for upload → stored file extension. The client encodes
 * all static raster images to WebP before uploading, so this is the complete
 * set of stored formats.
 */
export const UPLOAD_MIME_TO_EXT = {
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/svg+xml': 'svg',
	'video/mp4': 'mp4',
	'video/webm': 'webm'
};

/**
 * Stored file extension → MIME type for serving. A superset of the upload
 * formats: legacy raster formats may still exist on disk from seed data.
 */
export const EXT_TO_MIME = {
	webp: 'image/webp',
	gif: 'image/gif',
	svg: 'image/svg+xml',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	mp4: 'video/mp4',
	webm: 'video/webm'
};

/** Default values for media node properties (image and video). */
export const MEDIA_DEFAULTS = {
	src: '',
	mime_type: '',
	width: 0,
	height: 0,
	alt: '',
	scale: 1.0,
	focal_point_x: 0.5,
	focal_point_y: 0.5,
	object_fit: 'contain'
};

/**
 * Common aspect ratios to snap to when dragging resize handles.
 * Landscape ratios are listed first; portrait inversions are auto-generated.
 * The natural (original) ratio is always included at snap time, so it doesn't need to be here.
 */
const LANDSCAPE_RATIOS = [
	{ ratio: 1 / 1, label: '1:1' },
	{ ratio: 4 / 3, label: '4:3' },
	{ ratio: 16 / 9, label: '16:9' },
	{ ratio: 21 / 9, label: '21:9' }
];

export const SNAP_ASPECT_RATIOS: { ratio: number; label: string }[] = [
	...LANDSCAPE_RATIOS,
	// Add portrait inversions (skip 1:1 — its inverse is itself)
	...LANDSCAPE_RATIOS.filter((r) => r.ratio !== 1).map((r) => ({
		ratio: 1 / r.ratio,
		label: r.label.split(':').reverse().join(':')
	}))
];
