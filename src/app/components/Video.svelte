<script lang="ts">
	import { ASSET_BASE } from '#app/config.js';

	import type { PreviewMediaNode } from '#app/page_metadata.js';

	let { node, editable = false }: { node: PreviewMediaNode; editable?: boolean } = $props();

	// Determine if src is a blob URL (unsaved), a saved asset id, or empty
	let is_blob = $derived(node.src?.startsWith('blob:'));
	let is_saved = $derived(node.src && !is_blob);

	// Resolve the display URL and the saved video's derived poster URL.
	let display_src = $derived(is_blob ? node.src : is_saved ? `${ASSET_BASE}/${node.src}` : '');
	let poster_src = $derived(
		is_saved ? `${ASSET_BASE}/${node.src.slice(0, node.src.lastIndexOf('.'))}/poster.webp` : ''
	);

	// Apply scale to video (same as Image.svelte)
	let video_style = $derived(`
		object-position: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		transform: scale(${node.scale});
		transform-origin: ${node.focal_point_x * 100}% ${node.focal_point_y * 100}%;
		object-fit: ${node.object_fit};
	`);

	let video_el = $state<HTMLVideoElement | null>(null);
	let is_fullscreen = $state(false);

	// Autoplay handling — try multiple strategies since the element may be
	// mounted late (after hydration) and readiness events may have already fired.
	$effect(() => {
		const v = video_el;
		if (!v || !display_src) return;

		let cancelled = false;

		function try_play() {
			if (cancelled || !v) return;
			v.muted = true;
			const p = v.play();
			if (p) p.catch(() => {});
		}

		if (v.readyState >= 2) {
			try_play();
		} else {
			v.addEventListener('canplay', try_play, { once: true });
			v.addEventListener('loadeddata', try_play, { once: true });
		}

		const timer = setTimeout(try_play, 100);

		return () => {
			cancelled = true;
			clearTimeout(timer);
			v.removeEventListener('canplay', try_play);
			v.removeEventListener('loadeddata', try_play);
		};
	});

	function enter_fullscreen(e: MouseEvent) {
		// Only allow fullscreen in published view (not editable)
		if (editable) return;
		e.preventDefault();
		const v = video_el;
		if (!v || is_fullscreen) return;

		// Enable controls and unmute for fullscreen experience
		v.controls = true;
		v.muted = false;

		if (v.requestFullscreen) {
			v.requestFullscreen();
		} else if ((v as any).webkitEnterFullscreen) {
			(v as any).webkitEnterFullscreen();
		} else if ((v as any).webkitRequestFullscreen) {
			(v as any).webkitRequestFullscreen();
		}
	}

	// Listen for fullscreen exit events and restore inline state.
	$effect(() => {
		const v = video_el;
		if (!v) return;

		function resume_inline() {
			if (!v) return;
			is_fullscreen = false;
			v.controls = false;
			v.muted = true;
			const p = v.play();
			if (p) p.catch(() => {});

			// iOS pauses the video again ~200-400ms after the initial play succeeds,
			// so retry once after 500ms
			setTimeout(() => {
				if (!v || !v.paused) return;
				v.muted = true;
				const p2 = v.play();
				if (p2) p2.catch(() => {});
			}, 500);
		}

		// Standard Fullscreen API (Chrome, Firefox, Safari desktop)
		function handle_fullscreen_change() {
			if (!v) return;
			const fs = document.fullscreenElement || (document as any).webkitFullscreenElement;
			if (fs === v) {
				is_fullscreen = true;
			} else if (!fs) {
				resume_inline();
			}
		}

		// iOS Safari fires this on the video element itself
		function handle_webkit_end_fullscreen() {
			resume_inline();
		}

		// Track fullscreen entry on iOS
		function handle_webkit_begin_fullscreen() {
			is_fullscreen = true;
		}

		v.addEventListener('webkitbeginfullscreen', handle_webkit_begin_fullscreen);
		document.addEventListener('fullscreenchange', handle_fullscreen_change);
		document.addEventListener('webkitfullscreenchange', handle_fullscreen_change);
		v.addEventListener('webkitendfullscreen', handle_webkit_end_fullscreen);

		return () => {
			document.removeEventListener('fullscreenchange', handle_fullscreen_change);
			document.removeEventListener('webkitfullscreenchange', handle_fullscreen_change);
			v.removeEventListener('webkitbeginfullscreen', handle_webkit_begin_fullscreen);
			v.removeEventListener('webkitendfullscreen', handle_webkit_end_fullscreen);
		};
	});
</script>

{#if display_src}
	<video
		bind:this={video_el}
		contenteditable="false"
		src={display_src}
		poster={poster_src || undefined}
		aria-label={node.alt}
		width={node.width}
		height={node.height}
		style={video_style}
		autoplay
		muted
		loop
		playsinline
		disablepictureinpicture
		preload="auto"
		onclick={enter_fullscreen}
		class:cursor-fullscreen={!editable && !is_fullscreen}
	></video>
{/if}

<style>
	video {
		width: 100%;
		height: 100%;
		transform-origin: center center;
	}

	/* Fullscreen playback cursor with a contrasting outline over video. */
	.cursor-fullscreen {
		cursor:
			url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2264%22%20viewBox%3D%220%200%20120%2064%22%3E%3Cg%20fill%3D%22none%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M56%206H48V14M64%206H72V14M72%2022V30H64M56%2030H48V22%22%20stroke%3D%22white%22%20stroke-width%3D%225%22%2F%3E%3Cpath%20d%3D%22M56%206H48V14M64%206H72V14M72%2022V30H64M56%2030H48V22%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M57%2012L65%2018L57%2024Z%22%20fill%3D%22black%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%2260%22%20y%3D%2252%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22black%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linejoin%3D%22round%22%20paint-order%3D%22stroke%22%3EWatch%20Fullscreen%3C%2Ftext%3E%3C%2Fsvg%3E') 60 18,
			pointer;
	}
</style>
