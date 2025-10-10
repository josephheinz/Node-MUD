<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as store from '$lib/store';
	import { hydrateEquipment } from '$lib/types/equipment';
	import { getModifiedStats, Stats } from '$lib/types/stats';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { hydrateInventory } from '$lib/utils/item';

	let { children } = $props();

	(async () => {
		const inv = hydrateInventory($page.data.inventory);
		const eq = hydrateEquipment($page.data.equipment);

		store.inventory.set(inv);
		store.equipment.set(eq);
		store.user.set($page.data.user ?? null);
		store.baseStats.set($page.data.stats ?? { ...Stats });
		store.modifiedStats.set(getModifiedStats(get(store.baseStats), get(store.equipment)));
	})();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-full w-full bg-zinc-900 text-white">
	{@render children?.()}
</div>
