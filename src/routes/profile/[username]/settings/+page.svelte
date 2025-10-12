<script lang="ts">
	import { page } from '$app/stores';
	import { faGear, faUser } from '@fortawesome/free-solid-svg-icons';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import type { IApiSettings } from '../+layout.server';
	import ToggleSwitch from '$lib/components/toggleSwitch.svelte';
	import { capitalizeAfterSpaces } from '$lib/utils/general';

	type Profile = {
		id: string;
		username: string;
		joined_at: Date;
		profile_picture: string;
		display_name: string;
	};

	let profile: Profile | undefined = $page.data.profile;
	let user: User | undefined = $page.data.user;
	let apiSettings: IApiSettings = $page.data.apiSettings;

	onMount(async () => {
		if (profile?.id !== user?.id) {
			location.href = '/';
		}
	});
</script>

<title>Your Settings</title>

{#if profile}
	{@const joinDate = new Date(profile.joined_at)}
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
			</section>
			{#if profile.id === user?.id}
				<a
					href="/profile/{profile.username}"
					class="m-2 mx-auto flex w-4/5 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-500 bg-zinc-600 px-4 py-2 hover:border-zinc-300 hover:bg-zinc-400 hover:text-zinc-900"
					><Fa icon={faUser} />Profile</a
				>
			{/if}
		</aside>
		<section class="flex grow-4 items-start justify-start p-4">
			<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
				<h1 class="text-xl font-bold">API Settings</h1>
				<hr class="mb-2 text-zinc-500" />
				{@render apiSetting('inventory_api', apiSettings?.inventory_api ?? true)}
				{@render apiSetting('equipment_api', apiSettings?.equipment_api ?? true)}
			</div>
		</section>
	</main>
{/if}

{#snippet apiSetting(name: string, on: boolean)}
	{@const displayName = capitalizeAfterSpaces(name.split('_').join(' '))}
	<div class="flex w-full items-center justify-between gap-8">
		<span class="text-lg font-semibold">{displayName}</span>
		<ToggleSwitch value={on} />
	</div>
{/snippet}
