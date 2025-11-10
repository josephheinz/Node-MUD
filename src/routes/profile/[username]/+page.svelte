<script lang="ts">
	import { page } from '$app/stores';
	import EquipmentDisplay from '$lib/components/character/equipmentDisplay.svelte';
	import Inventory from '$lib/components/character/inventory.svelte';
	import { EmptyEquipment, type Equipment } from '$lib/types/equipment';
	import type { Item } from '$lib/types/item';
	import { getEquipment, getInventory } from '$lib/utils/general';
	import { faGear, faHome } from '@fortawesome/free-solid-svg-icons';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import type { IApiSettings } from './+layout.server';

	type Profile = {
		id: string;
		username: string;
		joined_at: Date;
		last_logged_in: Date;
		profile_picture: string;
		display_name: string;
	};

	let profile: Profile | undefined = $page.data.profile;
	let inventory: Item[] = $state([]);
	let equipment: Equipment = $state(EmptyEquipment);
	let user: User | undefined = $page.data.user;
	let apiSettings: IApiSettings | undefined = $page.data.api_settings;

	onMount(async () => {
		if (profile) {
			inventory = await getInventory(`${profile?.id}`);
			equipment = await getEquipment(`${profile?.id}`);
			console.log(apiSettings);
		}
	});
</script>

<title>{profile?.display_name ?? `@${profile?.username}`}'s Profile</title>

{#if profile}
	{@const joinDate = new Date(profile.joined_at)}
	{@const lastOnline = new Date(profile.last_logged_in)}
	<main class="flex h-full w-full gap-2">
		<aside
			class="flex h-full flex-col items-end justify-between border-r-2 border-zinc-700 p-4 py-[10vh]"
		>
			<section class="flex flex-col items-end justify-start">
				<!-- svelte-ignore a11y_img_redundant_alt -->
				<img
					src={profile.profile_picture ?? '/images/blank_pfp.webp'}
					class="aspect-square h-24 rounded-lg border-4 border-zinc-600"
					alt="Profile Picture"
				/>

				<h1 class="text-2xl font-semibold text-zinc-300">
					{profile.display_name ?? profile.username}
				</h1>
				<h2 class="text-lg font-medium text-zinc-500">@{profile.username}</h2>
				<p class="text-sm font-light text-zinc-500">Joined: {joinDate.toLocaleDateString()}</p>
				<p class="text-sm font-light text-zinc-500">
					Last Online: {lastOnline.toLocaleDateString()}
				</p>
			</section>
			{#if profile.id === user?.id}
				<a
					href="/profile/{profile.username}/settings"
					class="m-2 mx-auto flex w-4/5 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-600 px-4 py-2 hover:border-zinc-300 hover:bg-zinc-400 hover:text-zinc-900"
					><Fa icon={faGear} />Settings</a
				>
			{/if}
		</aside>
		<section class="flex grow-4 items-start justify-start p-4">
			{#if apiSettings?.equipment_api == true || user?.id === profile.id}
				<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
					<h1 class="text-xl font-bold">Equipment</h1>
					<hr class="mb-2 text-zinc-500" />
					<EquipmentDisplay {equipment} display={true} />
				</div>
			{/if}
			{#if apiSettings?.inventory_api == true || user?.id === profile.id}
				<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
					<h1 class="text-xl font-bold">Inventory</h1>
					<hr class="mb-2 text-zinc-500" />
					<Inventory {inventory} display={true} />
				</div>
			{/if}
		</section>
	</main>
{:else}
	<div class="flex h-full w-full flex-col items-center justify-center gap-8">
		<h1 class="text-5xl font-black">Profile doesn't exist</h1>
		<a
			href="/"
			class="flex items-center justify-between gap-2 text-2xl font-semibold hover:underline"
			><Fa icon={faHome} /> Home</a
		>
	</div>
{/if}
