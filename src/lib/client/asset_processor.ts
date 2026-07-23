import { encode as encodeWebP } from '@jsquash/webp';

const WEBP_QUALITY = 80;

/**
 * Decode an image file to ImageData using the browser's built-in decoding.
 * Works for JPEG, PNG, WebP, GIF, BMP, etc.
 */
async function decode_to_image_data(blob: Blob): Promise<ImageData> {
	const bitmap = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get OffscreenCanvas 2d context');
	ctx.drawImage(bitmap, 0, 0);
	bitmap.close();
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Convert ImageData to a PNG blob using canvas.
 */
async function image_data_to_png_blob(image_data: ImageData): Promise<Blob> {
	const canvas = new OffscreenCanvas(image_data.width, image_data.height);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get OffscreenCanvas 2d context');
	ctx.putImageData(image_data, 0, 0);
	return await canvas.convertToBlob({ type: 'image/png' });
}

/**
 * Resize an image blob to a specific width using canvas, maintaining aspect ratio.
 */
async function resize_blob_to_width(blob: Blob, target_width: number): Promise<ImageData> {
	const bitmap = await createImageBitmap(blob);
	const scale = target_width / bitmap.width;
	const target_height = Math.round(bitmap.height * scale);
	const canvas = new OffscreenCanvas(target_width, target_height);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		bitmap.close();
		throw new Error('Could not get OffscreenCanvas 2d context');
	}
	ctx.drawImage(bitmap, 0, 0, target_width, target_height);
	bitmap.close();
	return ctx.getImageData(0, 0, target_width, target_height);
}

/**
 * Resize ImageData to fit within max_width, preserving aspect ratio.
 * Returns the original ImageData if it already fits.
 */
async function resize_to_fit(image_data: ImageData, max_width: number): Promise<ImageData> {
	const { width } = image_data;
	if (width <= max_width) return image_data;

	const png_blob = await image_data_to_png_blob(image_data);
	return await resize_blob_to_width(png_blob, max_width);
}

/**
 * Resize ImageData to a specific width, maintaining aspect ratio.
 */
async function resize_to_width(image_data: ImageData, target_width: number): Promise<ImageData> {
	const png_blob = await image_data_to_png_blob(image_data);
	return await resize_blob_to_width(png_blob, target_width);
}

/**
 * Encode ImageData to WebP ArrayBuffer.
 */
async function encode_to_webp(image_data: ImageData, quality = WEBP_QUALITY): Promise<ArrayBuffer> {
	return await encodeWebP(image_data, { quality });
}

function post_status(status: string) {
	self.postMessage({ type: 'status', status });
}

/**
 * Handle a process request from the main thread.
 */
async function handle_process(data: { file: File; max_width: number; variant_widths: number[] }) {
	const { file, max_width, variant_widths } = data;

	try {
		// 1. Decode to raw pixels
		post_status('Decoding…');
		let image_data = await decode_to_image_data(file);

		// 2. Resize to fit max width if needed
		if (image_data.width > max_width) {
			post_status('Resizing original…');
			image_data = await resize_to_fit(image_data, max_width);
		}

		const original_width = image_data.width;
		const original_height = image_data.height;

		// 3. Encode the (possibly resized) original as WebP
		post_status('Encoding original as WebP…');
		const original_buffer = await encode_to_webp(image_data);

		// 4. Generate size variants (only for widths smaller than the original)
		const applicable_widths = variant_widths.filter((w) => w < original_width);
		const variants: Array<{ width: number; buffer: ArrayBuffer }> = [];

		for (let i = 0; i < applicable_widths.length; i++) {
			const target_width = applicable_widths[i];
			post_status(`Encoding variant ${i + 1}/${applicable_widths.length} (w${target_width})…`);

			const resized = await resize_to_width(image_data, target_width);
			const buffer = await encode_to_webp(resized);
			variants.push({ width: target_width, buffer });
		}

		post_status('Done');

		// Collect all transferable ArrayBuffers
		const transferables = [original_buffer, ...variants.map((v) => v.buffer)];

		self.postMessage(
			{
				type: 'result',
				original: { buffer: original_buffer, width: original_width, height: original_height },
				variants: variants.map((v) => ({ width: v.width, buffer: v.buffer }))
			},
			{ transfer: transferables }
		);
	} catch (err) {
		self.postMessage({
			type: 'error',
			error: err instanceof Error ? err.message : 'Processing failed'
		});
	}
}

self.addEventListener('message', (e) => {
	if (e.data?.type === 'process') {
		handle_process(e.data);
	}
});
