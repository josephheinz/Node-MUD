<script lang="ts">
	import ItemRenderer from './itemRenderer.svelte';
	import type { Item } from '$lib/types/item';
	import { createEventDispatcher } from 'svelte';
	import Container from './generic/container.svelte';

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

<Container
	class="absolute z-50 m-2 max-h-32 w-max max-w-96 overflow-y-auto"
	style="top: {y}px; left: {x}px;"
>
	<div class="inline-grid grid-cols-5 gap-2">
		{#each allItems as item (item.uid)}
			{#if filter(item)}
				<button onclick={() => selectItem(item)} class="ignore">
					<ItemRenderer {item} equippable={false} />
				</button>
			{/if}
		{/each}
	</div>
</Container>
