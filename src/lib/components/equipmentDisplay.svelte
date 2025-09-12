<script lang="ts">
	import type { EquipmentSlot, Equipment } from '$lib/types';
	import type { Item } from '$lib/items';
	import ItemRenderer from './itemRenderer.svelte';

	const { equipment }: { equipment: Equipment } = $props();

	const slotGridSpots = {
		head: 'col-start-2 row-start-1',
		body: 'col-start-2 row-start-2',
		legs: 'col-start-2 row-start-3',
		offhand: 'col-start-3 row-start-2',
		mainhand: 'col-start-1 row-start-2'
	};
</script>

<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
	<h1 class="text-xl font-bold">Your Equipment:</h1>
	<div class="my-2 inline-grid h-full w-full grid-cols-3 grid-rows-3 gap-2">
		{#each Object.entries(equipment) as [slot, item]}
			{@render equipmentSlot(slot as EquipmentSlot, item)}
		{/each}
	</div>
</div>

{#snippet equipmentSlot(slotname: EquipmentSlot, item: Item | undefined)}
	{#if item}
		<ItemRenderer {item} mode={'ascii'} pclass={slotGridSpots[slotname]} />
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
