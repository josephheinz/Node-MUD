<script lang="ts">
	import DarkModeButton from '$lib/components/ui/darkModeButton.svelte';
	import { tab } from '$lib/store.svelte';
	import Inventory from '$lib/components/ui/character/inventory.svelte';
	import HomeScreen from '$lib/components/ui/homeScreen.svelte';
	import Equipment from '$lib/components/ui/character/equipment.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let currentTab = $derived(tab.tab);

	$effect(() => {
		currentTab = tab.tab;
	});
</script>


{#if currentTab === 'Home'}
	<HomeScreen />
{:else if currentTab === 'Inventory'}
	<Inventory />
{:else if currentTab === 'Equipment'}
	<Equipment />
{/if}
