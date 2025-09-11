<script lang="ts">
	import type { Item } from '$lib/items';
	import ItemRenderer from './itemRenderer.svelte';

	const { inventory }: { inventory: Item[] } = $props();
</script>

<div class="w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
	<h1 class="text-xl font-bold">Your Inventory:</h1>
	<div class="my-2 inline-grid h-full w-full grid-cols-5 gap-2">
		{#each inventory as item}
			<ItemRenderer {item} mode={'ascii'} />
		{/each}
	</div>
</div>
