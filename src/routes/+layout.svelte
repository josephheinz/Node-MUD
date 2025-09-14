<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as store from '$lib/store';
	import { page } from '$app/stores';
	import { type Equipment } from '$lib/types';
	import { hydrateEquipment, hydrateInventory, type Item } from '$lib/items';
	import { onMount } from 'svelte';

	let { children } = $props();

	(async () => {
		const inv = await hydrateInventory($page.data.inventory);
		const eq = await hydrateEquipment($page.data.equipment);

		store.inventory.set(inv);
		store.equipment.set(eq);
		store.user.set($page.data.user ?? null);
	})();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-full w-full bg-zinc-900 text-white">
	{@render children?.()}
</div>
