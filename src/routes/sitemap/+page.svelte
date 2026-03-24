<script>
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Admin Sitemap - Editable Website</title>
</svelte:head>

<div class="mx-auto mt-12 max-w-4xl rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight text-neutral-900">Pages</h1>

		<div class="flex gap-3">
			<form method="POST" action="?/create">
				<button
					type="submit"
					class="rounded-md border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
				>
					+ Create blank page
				</button>
			</form>
			<form method="POST" action="?/create_post">
				<button
					type="submit"
					class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
				>
					+ Create blog post
				</button>
			</form>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
			<p class="text-red-700">{form.error}</p>
		</div>
	{/if}

	<div class="overflow-hidden rounded-md border border-neutral-200">
		<table class="w-full border-collapse text-left">
			<thead>
				<tr
					class="border-b border-neutral-200 bg-neutral-50 text-sm tracking-wider text-neutral-500 uppercase"
				>
					<th class="px-6 py-3 font-medium">Title</th>
					<th class="px-6 py-3 font-medium">ID / URL</th>
					<th class="px-6 py-3 font-medium">Status</th>
					<th class="px-6 py-3 text-right font-medium">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-neutral-200 text-neutral-800">
				{#each data.pages as page}
					<tr
						class="group border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50"
					>
						<td class="px-6 py-4 font-medium">{page.title}</td>
						<td class="px-6 py-4 font-mono text-sm text-neutral-500">
							<a href="/{page.document_id}" class="hover:text-blue-600 hover:underline">
								/{page.document_id}
							</a>
						</td>
						<td class="px-6 py-4">
							{#if page.status === 'public'}
								<span
									class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
								>
									Public
								</span>
							{:else}
								<span
									class="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800"
								>
									Draft
								</span>
							{/if}
						</td>
						<td class="px-6 py-4 text-right">
							<div class="flex justify-end gap-3">
								<a
									href="/{page.document_id}"
									class="text-sm font-medium text-blue-600 hover:text-blue-800"
								>
									Edit
								</a>
								{#if page.document_id !== data.home_page_id}
									<form
										method="POST"
										action="?/delete"
										onsubmit={(e) =>
											!confirm('Are you sure you want to delete this page?') && e.preventDefault()}
									>
										<input type="hidden" name="id" value={page.document_id} />
										<button
											type="submit"
											class="text-sm font-medium text-red-600 hover:text-red-800"
										>
											Delete
										</button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}

				{#if data.pages.length === 0}
					<tr>
						<td colspan="4" class="py-8 text-center text-neutral-500">No pages found.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
