<script lang="ts">
	import type { Item } from '$lib/items';
	import type { Equipment } from '$lib/types';
	import EquipmentDisplay from './equipmentDisplay.svelte';
	import Inventory from './inventory.svelte';

	const { equipment, inventory }: { equipment: Equipment; inventory: Item[] } = $props();

	let tab: 'inventory' | 'equipment' = $state('inventory');
</script>

<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
	<div class="flex w-full items-center justify-around">
		<button
			onclick={() => (tab = 'inventory')}
			class="cursor-pointer {tab == 'inventory' ? 'border-b-2 border-white' : ''}">Inventory</button
		>
		<button
			onclick={() => (tab = 'equipment')}
			class="cursor-pointer {tab == 'equipment' ? 'border-b-2 border-white' : ''}">Equipment</button
		>
	</div>
	<br />
	{#if tab === 'inventory'}
		<Inventory {inventory} />
	{:else if tab === 'equipment'}
		<EquipmentDisplay {equipment} />
	{/if}
</div>
