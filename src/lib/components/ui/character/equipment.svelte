<script lang="ts">
	import { gameState } from '$lib/store.svelte';
	import type { Equipment, EquipmentSlot, Item } from '$lib/types/item';
	import * as Card from '../card';
	import ItemRenderer from '../itemRenderer.svelte';

	const { display = false }: { display?: boolean } = $props();

	let equipment: Equipment = $state(gameState.equipment);

	const slotGridSpots: Record<EquipmentSlot, string> = {
		Head: 'col-start-3 row-start-1',
		Body: 'col-start-3 row-start-2',
		Legs: 'col-start-3 row-start-3',
		Offhand: 'col-start-4 row-start-2',
		Mainhand: 'col-start-2 row-start-2',
		Necklace: 'col-start-4 row-start-1',
		Ring: 'col-start-2 row-start-1',
		Hands: 'col-start-2 row-start-3'
	};

	$effect(() => {
		equipment = gameState.equipment;
	});
</script>

<Card.Root class="select-none">
	<Card.Header>
		<Card.Title>Your Equipment</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="grid size-full grid-cols-5 grid-rows-5 gap-2">
			{#each equipment.export() as [slot, item] (`${slot}-${item?.uid ?? 'empty'}`)}
				{@render equipmentSlot(slot as EquipmentSlot, item)}
			{/each}
		</div>
	</Card.Content>
</Card.Root>

{#snippet equipmentSlot(slot: EquipmentSlot, item: Item | null)}
	{#if item}
		<ItemRenderer
			{item}
			class={slotGridSpots[slot]}
			equipFlags={{ equippedSlot: slot, equippable: !display }}
		/>
	{:else}
		<div
			class="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 select-none {slotGridSpots[
				slot
			]}"
		>
			<h1 class="text-sm font-semibold">{slot as EquipmentSlot}</h1>
		</div>
	{/if}
{/snippet}
