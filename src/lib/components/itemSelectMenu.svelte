<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Item } from '$lib/types/item';
	import { createEventDispatcher } from 'svelte';
	import ItemRenderer from './ui/itemRenderer.svelte';

	const {
		items,
		x = 0,
		y = 0,
		filter = (item: Item) => {
			return true;
		}
	}: { items: Item[]; x: number; y: number; filter: (item: Item) => boolean } = $props();

	const dispatch = createEventDispatcher();

	function selectItem(item: Item) {
		dispatch('select', item);
	}
</script>

<Card.Root
	class="absolute z-50 m-2 max-h-32 w-max max-w-96 overflow-y-auto"
	style="top: {y}px; left: {x}px;"
>
	<Card.Content class="inline-grid grid-cols-5 gap-2">
		{#each items as item (item.uid)}
			{#if filter(item)}
				<button
					onclick={() => {
						selectItem(item);
					}}
				>
					<ItemRenderer {item} equipFlags={{ equippable: false }} />
				</button>
			{/if}
		{/each}
	</Card.Content>
</Card.Root>
