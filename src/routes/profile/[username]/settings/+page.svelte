<script lang="ts">
	import { page } from '$app/stores';
	import { faGear, faUser } from '@fortawesome/free-solid-svg-icons';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import type { IApiSettings } from '../+layout.server';
	import ToggleSwitch from '$lib/components/toggleSwitch.svelte';
	import { capitalizeAfterSpaces, capitalizeFirstLetter } from '$lib/utils/general';
	import { AccoladeReferences } from '$lib/utils/chat';

	type Profile = {
		id: string;
		username: string;
		joined_at: Date;
		last_logged_in: Date;
		profile_picture: string;
		display_name: string;
		accolades: string[];
	};

	let profile: Profile | undefined = $page.data.profile;
	let user: User | undefined = $page.data.user;
	let apiSettings: IApiSettings = $state<IApiSettings>($page.data.api_settings);

	onMount(async () => {
		if (profile?.id !== user?.id) {
			location.href = '/';
		}
	});

	async function updateSetting(name: string, value: any): Promise<void> {
		fetch(`/api/settings/${user?.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ setting: { name: name, value: value } })
		})
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJson;
			})
			.then((data) => {
				apiSettings = data.settings as IApiSettings;
			})
			.catch((error) => {
				console.error(error);
			});
	}
</script>

<title>Your Settings</title>

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
				{#if profile.accolades && profile.accolades.length}
					<div class="m-auto grid grid-cols-4 gap-2 px-2 py-4">
						{#each profile.accolades as accolade, index}
							{@const accRef = AccoladeReferences[accolade]}
							<!--We do not mention the grid positioning-->
							{@const colStart = (index + 1) % 4 == 0 ? -4 : ((index + 1) % 4) * -1}
							{@const rowStart = Math.trunc((index != 4 ? index : 3 + 1) / 4) + 1}
							<Fa
								icon={accRef.icon}
								size="lg"
								style={`color:${accRef.color}; grid-column-start: ${colStart}; grid-row-start:${rowStart};`}
								title={capitalizeFirstLetter(accolade)}
							/>
						{/each}
					</div>
				{/if}
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
				{@render apiSetting('inventory_api', apiSettings?.inventory_api)}
				{@render apiSetting('equipment_api', apiSettings?.equipment_api)}
			</div>
		</section>
	</main>
{/if}

{#snippet apiSetting(name: string, on: boolean)}
	{@const displayName = capitalizeAfterSpaces(name.split('_').join(' '))}
	<div class="flex w-full items-center justify-between gap-8">
		<span class="text-lg font-semibold">{displayName}</span>
		<ToggleSwitch value={on} on:toggle={async () => await updateSetting(name, !on)} />
	</div>
{/snippet}
