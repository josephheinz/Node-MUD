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
	let inventory: Item[] = $state([]);
	let equipment = $state(new EmptyEquipment());

	onMount(async () => {
		console.log(user?.id);
		const res = await fetch(`/api/inventory/${user?.id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJson;
			})
			.then(async (data) => {
				console.log('Success:', data);
				data.inventory.forEach(async (item: DBItem) => {
					let loadedItem = await loadDbItem(item);
					inventory.push(loadedItem);
				});
			})
			.catch((error) => {
				console.error(error);
			});

		const resEquip = await fetch(`/api/equipment/${user?.id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJson;
			})
			.then(async (data) => {
				console.log(`Success: ${JSON.stringify(data)}`);
				for (const [slotKey, item] of Object.entries(data.equipment) as [
					EquipmentSlot,
					Item | undefined
				][]) {
					if (!item) continue;
					let loadedItem = await loadDbItem(item);
					data.equipment[slotKey] = loadedItem;
				}
				equipment = data.equipment;
			})
			.catch((error) => {
				console.error(error);
			});
	});
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
