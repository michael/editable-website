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

/** URL prefix for serving assets */
export const ASSET_BASE = '/assets';

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
	{ ratio: 21 / 9, label: '21:9' },
 ];

/** @type {{ ratio: number, label: string }[]} */
export const SNAP_ASPECT_RATIOS = [
	...LANDSCAPE_RATIOS,
	// Add portrait inversions (skip 1:1 — its inverse is itself)
	...LANDSCAPE_RATIOS
		.filter(r => r.ratio !== 1)
		.map(r => ({ ratio: 1 / r.ratio, label: r.label.split(':').reverse().join(':') })),
];
