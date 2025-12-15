<script lang="ts">
	import type { Equipment } from '$lib/types/equipment';
	import type { Item } from '$lib/types/item';
	import type { StatList } from '$lib/types/stats';
	import EquipmentDisplay from './equipmentDisplay.svelte';
	import Inventory from './inventory.svelte';
	import StatsDisplay from './statsDisplay.svelte';

	const {
		equipment,
		inventory,
		stats
	}: { equipment: Equipment; inventory: Item[]; stats: StatList } = $props();

	let tab: 'inventory' | 'equipment' | 'stats' = $state('inventory');
</script>

<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
	<div class="flex w-full items-center justify-around">
		<button
			onclick={() => (tab = 'inventory')}
			class="ignore cursor-pointer {tab == 'inventory' ? 'border-b-2 border-white' : ''}">Inventory</button
		>
		<button
			onclick={() => (tab = 'equipment')}
			class="ignore cursor-pointer {tab == 'equipment' ? 'border-b-2 border-white' : ''}">Equipment</button
		>
		<button
			onclick={() => (tab = 'stats')}
			class="ignore cursor-pointer {tab == 'stats' ? 'border-b-2 border-white' : ''}">Stats</button
		>
	</div>
	<br />
	<div class="flex h-max w-full items-center justify-center">
		{#if tab === 'inventory'}
			<Inventory {inventory} />
		{:else if tab === 'equipment'}
			<EquipmentDisplay {equipment} />
		{:else if tab === 'stats'}
			<StatsDisplay {stats} />
		{/if}
	</div>
</div>
