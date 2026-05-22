<script>
	import { getContext } from 'svelte';

	const svedit = getContext('svedit');

	let { title = 'Angebotsauswahl' } = $props();
	let is_editing = $derived(svedit.editable);

	function go_back() {
		if (is_editing) return;
		history.back();
	}
</script>

<header
	contenteditable="false"
	class="flex h-16 shrink-0 items-center justify-between bg-[#2b2e34] px-5 text-white md:h-26 md:px-10"
	class:opacity-60={is_editing}
	aria-disabled={is_editing}
>
	<div class="flex flex-1 items-center justify-start">
		<button
			type="button"
			class="inline-flex h-12 items-center gap-2 rounded-md bg-[#6cbfc0] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-14 md:px-6 md:text-base"
			onclick={go_back}
			disabled={is_editing}
		>
			<svg
				class="size-4"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 15 15"
				fill="none"
				aria-hidden="true"
			>
				<path d="M9.5 3.5L5.5 7.5L9.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" />
			</svg>
			<span>Zurück</span>
		</button>
	</div>

	<div class="min-w-0 flex-1 text-center text-sm font-semibold tracking-tight text-white/90 md:text-lg">
		{title}
	</div>

	<div class="flex flex-1 items-center justify-end gap-3 md:gap-4">
		<button
			type="button"
			class="inline-flex size-12 items-center justify-center rounded-md bg-[#6cbfc0] text-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:size-14"
			disabled={is_editing}
			aria-label="Hilfe"
		>
			?
		</button>
		<button
			type="button"
			class="inline-flex size-12 items-center justify-center rounded-md bg-[#367d96] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:size-14"
			onclick={go_back}
			disabled={is_editing}
			aria-label="Schließen"
		>
			<svg
				class="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 15 15"
				fill="none"
				aria-hidden="true"
			>
				<path d="M3.5 3.5L11.5 11.5M11.5 3.5L3.5 11.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="square" />
			</svg>
		</button>
	</div>
</header>
