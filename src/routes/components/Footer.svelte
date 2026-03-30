<script>
	import { getContext } from 'svelte';
	import { AnnotatedTextProperty, NodeArrayProperty, Node } from 'svedit';
	import { TW_LIMITER, TW_PAGE_PADDING_X } from '../tailwind_theme.js';
	import MediaProperty from './MediaProperty.svelte';

	const svedit = getContext('svedit');
	let { path } = $props();
	let node = $derived(svedit.session.get(path));
	let column_count = $derived(node.footer_link_columns?.length || 0);
	let grid_cols_class = $derived(
		column_count <= 1
			? 'lg:grid-cols-1'
			: column_count === 2
				? 'lg:grid-cols-2'
				: column_count === 3
					? 'lg:grid-cols-3'
					: 'lg:grid-cols-3'
	);
	let footer_background_style =
		"background: url('/assets/footer-bg.jpg') center left no-repeat; background-size: contain;background-color:#efefef;";
	let current_year = new Date().getFullYear();
</script>

<Node {path} class="lg:text-lg">
	<footer class="site-info custom-footer text-(--foreground)" style={footer_background_style}>
		<div class="{TW_LIMITER} pt-6 lg:pt-8">
			<div class="flex flex-col gap-10 py-10 lg:flex-row lg:justify-between {TW_PAGE_PADDING_X}">
				<div class="text-left lg:w-5/12">
					<div class="text-base leading-7">
						<AnnotatedTextProperty
							tag="h2"
							class="mb-3 text-2xl font-semibold tracking-tight"
							path={[...path, 'company_name']}
							placeholder={svedit.editable ? 'Company name' : undefined}
						/>
						<AnnotatedTextProperty
							tag="p"
							class="opacity-80"
							path={[...path, 'company_description']}
							placeholder={svedit.editable ? 'Short description' : undefined}
						/>
						<ul class="mt-4 space-y-2">
							<li>
								<AnnotatedTextProperty
									tag="span"
									class="inline"
									path={[...path, 'company_address']}
									placeholder={svedit.editable ? 'Address' : undefined}
								/>
							</li>
							<li>
								<AnnotatedTextProperty
									tag="span"
									class="inline"
									path={[...path, 'company_phone']}
									placeholder={svedit.editable ? 'Phone' : undefined}
								/>
							</li>
						</ul>
					</div>
				</div>
				<div class="lg:w-5/12">
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
						<div class="text-left lg:col-span-8">
							<div class="mt-3 text-base leading-7">
								<AnnotatedTextProperty
									tag="h4"
									class="mb-3 text-xl font-semibold"
									path={[...path, 'team_name']}
									placeholder={svedit.editable ? 'Name' : undefined}
								/>
								<AnnotatedTextProperty
									tag="p"
									class="opacity-80"
									path={[...path, 'team_description']}
									placeholder={svedit.editable ? 'Role or bio' : undefined}
								/>
							</div>
						</div>
						<div class="lg:col-span-4">
							<div class="border border-(--foreground)/20">
								<svelte:element
									this={svedit.editable ? 'div' : 'a'}
									href={svedit.editable ? undefined : '/'}
								>
									<MediaProperty
										path={[...path, 'team_thumb']}
										sizing="native"
										fallback_width={96}
										fallback_aspect_ratio="1 / 1"
									/>
								</svelte:element>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- <div class={TW_PAGE_PADDING_X}>
				<NodeArrayProperty
					class="footer-menu grid grid-cols-1 {grid_cols_class} gap-x-8 gap-y-6 pb-4 [--row:1] lg:gap-y-8"
					path={[...path, 'footer_link_columns']}
				/>
			</div> -->
			<div
				class="flex flex-wrap items-center justify-center gap-3 border-t border-(--foreground)/20 py-3 {TW_PAGE_PADDING_X}"
			>
				<span class="text-sm opacity-80">© {current_year}</span>
				<AnnotatedTextProperty
					class="text-sm opacity-80"
					path={[...path, 'copyright']}
					placeholder={svedit.editable ? 'Company name' : undefined}
				/>
			</div>
		</div>
	</footer>
</Node>
