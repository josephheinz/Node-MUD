<script lang="ts">
	import { getEquipment } from '$lib/remote/equipment.remote';
	import { gameState } from '$lib/store.svelte';
	import type { Equipment, EquipmentSlot, Item } from '$lib/types/item';
	import * as Card from '../card';
	import ItemRenderer from '../itemRenderer.svelte';

	const {
		equipment: initEquipment,
		display = false
	}: { display?: boolean; equipment?: Equipment } = $props();

	let equipment: Equipment = $state(initEquipment ?? gameState.equipment);

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
</script>

<Card.Root class="select-none">
	<Card.Header>
		<Card.Title>{!display ? 'Your ' : ''}Equipment</Card.Title>
	</Card.Header>
	<Card.Content>
		<svelte:boundary>
			{#snippet pending()}
				<span>Loading</span>
			{/snippet}
			<div class="grid size-full grid-cols-5 grid-rows-5 gap-2">
				{#each (await getEquipment(gameState.user?.id!)).equipment?.export() as [slot, item] (`${slot}-${item?.uid ?? 'empty'}`)}
					{@render equipmentSlot(slot as EquipmentSlot, item)}
				{/each}<!-- 
				{#each equipment.export() as [slot, item] (`${slot}-${item?.uid ?? 'empty'}`)}
				{/each} -->
			</div>
		</svelte:boundary>
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
			class="bg-card-background flex h-16 w-16 items-center justify-center rounded-lg border-2 border-ring text-card-foreground select-none {slotGridSpots[
				slot
			]}"
		>
			<h1 class="text-xs font-semibold">{slot as EquipmentSlot}</h1>
		</div>
	{/if}
{/snippet}
