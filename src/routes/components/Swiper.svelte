<script>
	import { getContext, onMount, onDestroy } from 'svelte';
	import { Node, NodeArrayProperty } from 'svedit';

	const TW_PAGE_PADDING_X = 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16';
	const SLIDE_HEIGHT = 480; // px

	let { path } = $props();

	const svedit = getContext('svedit');
	let node = $derived(svedit.session.get(path));

	/** @type {HTMLElement | null} */
	let track_el = $state(null);

	let current_index = $state(0);
	let slide_count = $state(0);

	const layouts = {
		1: 'max-w-4xl',
		2: 'w-full',
		3: 'max-w-full'
	};

	function get_layout_class() {
		const layout = node.layout ?? 1;
		return layouts[layout] || layouts[1];
	}

	function get_slides() {
		if (!track_el) return [];
		return Array.from(track_el.querySelectorAll('.swiper-slide'));
	}

	function go_to(index) {
		const slides = get_slides();
		if (!slides[index]) return;
		current_index = index;
		slides[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
	}

	function go_prev() {
		if (current_index > 0) go_to(current_index - 1);
	}

	function go_next() {
		if (current_index < slide_count - 1) go_to(current_index + 1);
	}

	// Update current_index when user scrolls the track manually
	function on_scroll() {
		const slides = get_slides();
		if (!slides.length || !track_el) return;
		const track_left = track_el.getBoundingClientRect().left;
		let closest = 0;
		let min_dist = Infinity;
		slides.forEach((el, i) => {
			const dist = Math.abs(el.getBoundingClientRect().left - track_left);
			if (dist < min_dist) { min_dist = dist; closest = i; }
		});
		current_index = closest;
	}

	let observer = null;
	let debounce_timer = null;

	function refresh() {
		slide_count = get_slides().length;
		if (current_index >= slide_count) {
			current_index = Math.max(0, slide_count - 1);
		}
	}

	onMount(() => {
		observer = new MutationObserver(() => {
			clearTimeout(debounce_timer);
			debounce_timer = setTimeout(refresh, 50);
		});
		if (track_el) {
			observer.observe(track_el, { childList: true, subtree: true });
			track_el.addEventListener('scroll', on_scroll, { passive: true });
		}
		setTimeout(refresh, 100);
	});

	onDestroy(() => {
		clearTimeout(debounce_timer);
		observer?.disconnect();
		track_el?.removeEventListener('scroll', on_scroll);
	});
</script>

<Node {path}>
	<div class="py-10 sm:py-14 md:py-16 lg:py-20">
		<div class="{TW_PAGE_PADDING_X} {get_layout_class()} mx-auto">
			<div class="carousel-root">
				<!-- Scrollable slide track: slides are in normal flow, scroll-snap handles navigation -->
				<div
					class="carousel-track"
					style:height="{SLIDE_HEIGHT}px"
					bind:this={track_el}
				>
					<NodeArrayProperty path={[...path, 'slides']} />
				</div>

				<!-- Navigation buttons -->
				{#if slide_count > 1}
					<button
						class="carousel-btn carousel-btn-prev"
						onclick={go_prev}
						disabled={current_index === 0}
						aria-label="Previous slide"
					>
						<svg width="10" height="18" viewBox="0 0 10 18" fill="none">
							<path d="M9 1L1 9l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<button
						class="carousel-btn carousel-btn-next"
						onclick={go_next}
						disabled={current_index === slide_count - 1}
						aria-label="Next slide"
					>
						<svg width="10" height="18" viewBox="0 0 10 18" fill="none">
							<path d="M1 1l8 8-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				{/if}

				<!-- Pagination dots -->
				{#if slide_count > 1}
					<div class="carousel-pagination">
						{#each { length: slide_count } as _, i}
							<button
								class="carousel-dot {i === current_index ? 'active' : ''}"
								onclick={() => go_to(i)}
								aria-label="Go to slide {i + 1}"
							></button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</Node>

<style>
	.carousel-root {
		position: relative;
	}

	/* Scroll-snapping track: slides sit in normal flex flow */
	.carousel-track {
		display: flex;
		flex-direction: row;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		/* Hide scrollbar visually */
		scrollbar-width: none;
	}

	.carousel-track::-webkit-scrollbar {
		display: none;
	}

	/* Each slide snaps to the left edge and fills the track */
	:global(.swiper-slide) {
		flex: 0 0 100%;
		width: 100%;
		height: 100%;
		scroll-snap-align: start;
		display: flex;
		align-items: stretch;
	}

	/* Nav buttons centered over the track */
	.carousel-btn {
		position: absolute;
		top: calc(var(--slide-h, 480px) / 2);
		transform: translateY(-50%);
		z-index: 10;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		border: none;
		cursor: pointer;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.carousel-btn:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.75);
	}

	.carousel-btn:disabled {
		opacity: 0.25;
		cursor: default;
	}

	.carousel-btn-prev { left: 0.75rem; }
	.carousel-btn-next { right: 0.75rem; }

	.carousel-pagination {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		padding-top: 0.75rem;
	}

	.carousel-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #ccc;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: background 0.2s;
	}

	.carousel-dot.active {
		background: #333;
	}
</style>
