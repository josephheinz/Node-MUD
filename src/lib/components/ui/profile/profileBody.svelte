<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import {
		EmptyEquipment,
		Equipment as TEquipment,
		Inventory as TInventory,
		type Item
	} from '$lib/types/item';
	import { onMount } from 'svelte';
	import type { IApiSettings } from '../../../../routes/profile/[username]/+layout.server';
	import { getEquipment, getInventory } from '$lib/utils/general';
	import Inventory from '../character/inventory.svelte';
	import Equipment from '../character/equipment.svelte';
	import type { User } from '@supabase/supabase-js';
	import { userPrefersMode } from 'mode-watcher';

	const {
		data
	}: {
		data: {
			profile: Profile | undefined;
			api_settings: IApiSettings | undefined;
			user: User | null;
		};
	} = $props();

	let inventory: TInventory | undefined = $state(undefined);
	let equipment: TEquipment | undefined = $state(undefined);
	let user: User | null = $state(data.user);
	let profile: Profile | undefined = $state(data.profile);
	let api_settings: IApiSettings | undefined = $state(data.api_settings);

	let isLoading = $state(true);

	onMount(async () => {
		inventory = await getInventory(`${data.profile?.id}`);
		equipment = await getEquipment(`${data.profile?.id}`);
		isLoading = false;
	});
</script>

<div class="flex items-center justify-start gap-4 p-4">
	{#if isLoading}
		<span>Loading...</span>
	{:else if profile && api_settings}
		{#if user?.id === profile.id}
			<Inventory {inventory} display={true} />
			<Equipment {equipment} display={true} />
		{:else}
			{#if api_settings.inventory_api}
				<Inventory {inventory} display={true} />
			{/if}
			{#if api_settings.equipment_api}
				<Equipment {equipment} display={true} />
			{/if}
		{/if}
	{/if}
</div>
