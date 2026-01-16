<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import { Equipment as TEquipment, Inventory as TInventory } from '$lib/types/item';
	import type { IApiSettings } from '../../../../routes/profile/[username]/+layout.server';
	import Inventory from '../character/inventory.svelte';
	import Equipment from '../character/equipment.svelte';
	import Spinner from '../spinner/spinner.svelte';
	import DisplayInventory from '../character/displayInventory.svelte';
	import DisplayEquipment from '../character/displayEquipment.svelte';

	const {
		data
	}: {
		data: {
			profile: Profile | undefined;
			apiSettings: IApiSettings | undefined;
			equipment: TEquipment | undefined;
			inventory: TInventory | undefined;
			isUser: boolean;
		};
	} = $props();

	let inventory = data.inventory;
	let user = data.isUser;
	let equipment = data.equipment;
	let api_settings = data.apiSettings;
	let profile = data.profile;
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="flex flex-col items-center justify-center gap-4">
			<h1 class="text-4xl font-black">Loading...</h1>
			<Spinner class="size-8" />
		</div>
	{/snippet}
	<div class="flex items-center justify-start gap-4 p-4">
		{#if profile && api_settings}
			{#if user}
				{#if inventory}
					<DisplayInventory {inventory} display={true} />
				{/if}
				{#if equipment}
					<DisplayEquipment {equipment} display={true} />
				{/if}
			{:else}
				{#if api_settings.inventory_api && inventory}
					<DisplayInventory {inventory} display={true} />
				{/if}
				{#if api_settings.equipment_api && equipment}
					<DisplayEquipment {equipment} display={true} />
				{/if}
			{/if}
		{/if}
	</div>
</svelte:boundary>
