<script lang="ts">
	import { page } from '$app/state';

	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import Inventory from '$lib/components/inventory.svelte';
	import { hydrateEquipment, hydrateInventory, type Item } from '$lib/items';
	import { type Equipment, EmptyEquipment } from '$lib/types';
	import EquipmentDisplay from '$lib/components/equipmentDisplay.svelte';

	let loginModalOpen = $state(false);
	let user = $state(page.data.user);
	let inventory = $state<Item[]>([]);
	let equipment = $state<Equipment>(EmptyEquipment);

	$effect(() => {
		hydrateFromPageData();
	});

	async function hydrateFromPageData() {
		const eq: Equipment = page.data.equipment;
		const inv: Item[] = page.data.inventory;

		console.log(eq, inv);
		if (eq) equipment = await hydrateEquipment(eq);
		if (inv) inventory = await hydrateInventory(inv);
	}
</script>

{#if user}
	<ProfileDropdown {user} />
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
<br />
<Inventory {inventory} />
<EquipmentDisplay {equipment} />
