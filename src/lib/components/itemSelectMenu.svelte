<script lang="ts">
	import ItemRenderer from './itemRenderer.svelte';
	import type { Item } from '$lib/items';
	import { createEventDispatcher } from 'svelte';

	const {
		allItems,
		x = 0,
		y = 0,
		filter = (item: Item) => {
			return true;
		}
	}: {
		allItems: Item[];
		x?: number;
		y?: number;
		filter: (item: Item) => boolean;
	} = $props();

	const dispatch = createEventDispatcher();

	function selectItem(item: Item) {
		dispatch('select', item);
	}
</script>

<div
	class="absolute z-50 m-2 max-h-32 w-max max-w-96 overflow-y-auto rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2 shadow-lg"
	style="top: {y}px; left: {x}px;"
>
	<div class="inline-grid grid-cols-5 gap-2">
		{#each allItems as item (item.uid)}
			{#if filter(item)}
				<button onclick={() => selectItem(item)}>
					<ItemRenderer {item} equippable={false} />
				</button>
			{/if}
		{/each}
	</div>
</div>
