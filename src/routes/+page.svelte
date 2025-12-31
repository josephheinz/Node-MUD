<script lang="ts">
	import { tab } from '$lib/store.svelte';
	import Inventory from '$lib/components/ui/character/inventory.svelte';
	import HomeScreen from '$lib/components/ui/homeScreen.svelte';
	import Equipment from '$lib/components/ui/character/equipment.svelte';

	let currentTab = $derived(tab.tab);

	$effect(() => {
		currentTab = tab.tab;
	});
</script>

<div class="inline-flex">
	{#if currentTab === 'Home'}
		<HomeScreen />
	{:else if currentTab === 'Inventory'}
		<Inventory />
	{:else if currentTab === 'Equipment'}
		<Equipment />
	{/if}
</div>
