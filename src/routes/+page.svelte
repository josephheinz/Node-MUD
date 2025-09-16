<script lang="ts">
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import Inventory from '$lib/components/inventory.svelte';
	import { EmptyEquipment, type Equipment } from '$lib/types';
	import EquipmentDisplay from '$lib/components/equipmentDisplay.svelte';
	import { contextmenu } from '$lib/components/contextmenu';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import type { Item } from '$lib/items';
	import CharacterMenu from '$lib/components/characterMenu.svelte';

	let loginModalOpen = $state(false);

	let user = $state(get(store.user));
	let inventory = $state<Item[]>(get(store.inventory));
	let equipment = $state<Equipment>(get(store.equipment));

	store.inventory.subscribe((value) => {
		inventory = value;
	});

	store.user.subscribe((value) => {
		user = value;
	});

	store.equipment.subscribe((value) => {
		equipment = value;
	});
</script>

{#if user}
	<ProfileDropdown {user} />
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
<br />
{#if inventory && equipment}
	<CharacterMenu {inventory} {equipment} />
{/if}
