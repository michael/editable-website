/**
 * Extract image dimensions using an <img> element.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
function get_image_dimensions(blob) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const object_url = URL.createObjectURL(blob);

		img.onload = () => {
			URL.revokeObjectURL(object_url);
			resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(object_url);
			reject(new Error('Failed to load image'));
		};

		img.src = object_url;
	});
}

/**
 * Extract dimensions from an SVG by parsing the viewBox attribute.
 * Falls back to get_image_dimensions if no viewBox is found.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
async function get_svg_dimensions(blob) {
	try {
		const text = await blob.text();
		const match = text.match(/viewBox=["']([^"']+)["']/);
		if (match) {
			const parts = match[1].trim().split(/[\s,]+/);
			if (parts.length === 4) {
				const width = parseFloat(parts[2]);
				const height = parseFloat(parts[3]);
				if (width > 0 && height > 0) {
					return { width: Math.round(width), height: Math.round(height) };
				}
			}
		}
	} catch {
		// Fall through to img-based extraction
	}
	return get_image_dimensions(blob);
}

/**
 * Extract video dimensions using a temporary <video> element.
 *
 * @param {Blob} blob
 * @returns {Promise<{ width: number, height: number }>}
 */
export function get_video_dimensions(blob) {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		const object_url = URL.createObjectURL(blob);
		let poll_id;

		function cleanup() {
			clearInterval(poll_id);
			URL.revokeObjectURL(object_url);
			video.removeAttribute('src');
			video.load();
		}

		function resolve_dimensions() {
			const { videoWidth, videoHeight } = video;
			cleanup();
			resolve({ width: videoWidth, height: videoHeight });
		}

		video.onloadedmetadata = resolve_dimensions;

		video.onerror = () => {
			cleanup();
			reject(new Error('Failed to load video metadata'));
		};

		video.src = object_url;

		// Firefox sometimes never fires loadedmetadata for detached video
		// elements, so poll readyState as a fallback (HAVE_METADATA = 1).
		poll_id = setInterval(() => {
			if (video.readyState >= 1) {
				resolve_dimensions();
			}
		}, 100);
	});
}

/**
 * Extract dimensions from a media file (image or video).
 *
 * @param {File} file
 * @returns {Promise<{ width: number, height: number }>}
 */
export function get_media_dimensions(file) {
	if (file.type.startsWith('video/')) return get_video_dimensions(file);
	if (file.type === 'image/svg+xml') return get_svg_dimensions(file);
	return get_image_dimensions(file);
}