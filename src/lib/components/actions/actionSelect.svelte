<script lang="ts">
	import ActionCategory from './actionCategory.svelte';
	import type { ActionCategory as AC } from '$lib/types/action';

	const { categories }: { categories: AC[] } = $props();
	let selectedCategory: AC = $state(categories[0]);
</script>

<div class="flex h-full w-full items-stretch justify-start bg-zinc-900">
	<aside class="h-full shrink border-r-2 border-zinc-600">
		{#each categories as category}
			<button
				class="flex w-full cursor-pointer items-center justify-center p-6 hover:bg-zinc-500"
				onclick={() => {
					selectedCategory = category;
				}}
			>
				{category as String}
			</button>
		{/each}
	</aside>
	<main class="h-full w-full grow p-2">
		<ActionCategory bind:category={selectedCategory} />
	</main>
</div>
