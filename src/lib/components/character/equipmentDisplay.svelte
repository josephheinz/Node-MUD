<script lang="ts">
	import type { EquipmentSlot, Equipment } from '$lib/types';
	import type { Item } from '$lib/items';
	import ItemRenderer from '../itemRenderer.svelte';

	const { equipment }: { equipment: Equipment } = $props();

	const slotGridSpots = {
		head: 'col-start-3 row-start-1',
		body: 'col-start-3 row-start-2',
		legs: 'col-start-3 row-start-3',
		offhand: 'col-start-4 row-start-2',
		mainhand: 'col-start-2 row-start-2',
		necklace: 'col-start-4 row-start-1',
		ring: 'col-start-2 row-start-1',
		hands: 'col-start-2 row-start-3'
	};
</script>

<div class="m-2 inline-grid h-full w-full max-w-96 grid-cols-5 grid-rows-5 gap-2">
	{#each Object.entries(equipment) as [slot, item] (`${slot}-${item?.uid ?? 'empty'}`)}
		{@render equipmentSlot(slot as EquipmentSlot, item)}
	{/each}
</div>

{#snippet equipmentSlot(slotname: EquipmentSlot, item: Item | null)}
	{#if item}
		<ItemRenderer {item} pclass={slotGridSpots[slotname]} equippedSlot={slotname} />
	{:else}
		<div
			class="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 select-none {slotGridSpots[
				slotname
			]}"
		>
			<h1 class="text-sm font-semibold">{slotname}</h1>
		</div>
	{/if}
{/snippet}
