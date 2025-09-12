<script lang="ts">
	import { page } from '$app/state';

	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import Inventory from '$lib/components/inventory.svelte';
	import { loadDbItem, type DBItem, type Item } from '$lib/items';
	import { onMount } from 'svelte';
	import Equipment from '$lib/components/equipment.svelte';
	import { EmptyEquipment, type EquipmentSlot } from '$lib/types';

	let loginModalOpen = $state(false);
	let user = $state(page.data.user);
	let inventory: Item[] = $state(page.data.inventory);
	let equipment = $state(page.data.equipment);
</script>

{#if user}
	<ProfileDropdown {user} />
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
<br />
<Inventory {inventory} />
<Equipment {equipment} />
