<script lang="ts">
	import ItemRenderer from './itemRenderer.svelte';
	import type { Item } from '$lib/items';
	import { createEventDispatcher } from 'svelte';

	const {
		open,
		allItems,
		x = 0,
		y = 0
	}: {
		open: boolean;
		allItems: Item[];
		x?: number;
		y?: number;
	} = $props();

	const dispatch = createEventDispatcher();

	function selectItem(item: Item) {
		dispatch('select', item);
	}
</script>

<div
	class="absolute z-50 m-2 max-h-28 w-max max-w-96 overflow-y-auto rounded-lg bg-zinc-800 p-2 shadow-lg"
	style="top: {y}px; left: {x}px;"
>
	<div class="inline-grid grid-cols-5 gap-2">
		{#each allItems as item}
			<div on:dblclick={() => selectItem(item)}>
				<ItemRenderer {item} mode="ascii" pclass="ring-border" />
			</div>
		{/each}
	</div>
</div>
