<script lang="ts">
	import { page } from '$app/stores';
	import { faUser } from '@fortawesome/free-solid-svg-icons';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';
	import type { IApiSettings } from '../+layout.server';
	import ToggleSwitch from '$lib/components/toggleSwitch.svelte';
	import { capitalizeAfterSpaces, capitalizeFirstLetter } from '$lib/utils/general';
	import { AccoladeReferences } from '$lib/utils/chat';
	import type { Profile } from '$lib/store';

	let profile: Profile | undefined = $state($page.data.profile);
	let user: User | undefined = $page.data.user;
	let apiSettings: IApiSettings = $state<IApiSettings>($page.data.api_settings);

	let displayNameValue: string | undefined = $state(profile?.display_name);
	let profilePictureValue: string | null = $state(profile?.profile_picture ?? null);

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

	async function updateProfile() {
		fetch(`/profile/${profile?.username}/settings/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				settings: { display_name: displayNameValue, profile_picture: profilePictureValue }
			})
		})
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJson;
			})
			.then((data) => {
				profile = data.profile as Profile;
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
					class="aspect-square h-24 rounded-lg border-4 border-zinc-600 object-cover"
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
		<section class="flex grow-4 flex-col items-start justify-start p-4">
			<div class="m-2 w-max rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
				<h1 class="text-xl font-bold">API Settings</h1>
				<hr class="mb-2 text-zinc-500" />
				{@render apiSetting('inventory_api', apiSettings?.inventory_api)}
				{@render apiSetting('equipment_api', apiSettings?.equipment_api)}
			</div>
			<div class="m-2 w-max gap-2 rounded-lg border-2 border-zinc-700 bg-zinc-800 p-2">
				<h1 class="text-xl font-bold">Profile Settings</h1>
				<hr class="mb-2 text-zinc-500" />
				<div class="flex items-center gap-2">
					<!-- svelte-ignore a11y_img_redundant_alt -->
					<img
						src={profile.profile_picture ?? '/images/blank_pfp.webp'}
						alt="Profile Picture"
						class="inline-block aspect-square h-24 rounded-lg border-4 border-zinc-600 object-cover"
					/>
					<div class="flex flex-col items-start justify-start gap-2">
						<label for="pfp-input">Profile Picture</label>
						<input
							type="url"
							bind:value={profilePictureValue}
							placeholder="https://example.com/example.png"
							class="rounded-md border-2 border-zinc-700 bg-zinc-800 transition-all outline-none invalid:border-rose-600 focus:ring-0 focus:outline-none"
						/>
					</div>
				</div>
				<hr class="my-2 text-zinc-500" />
				<div class="flex flex-col gap-2">
					<label for="displayname">Display Name</label>
					<input
						type="text"
						bind:value={displayNameValue}
						placeholder={profile.display_name ?? profile.username}
						class="rounded-md border-2 border-zinc-700 bg-zinc-800 transition-all outline-none invalid:border-rose-600 focus:ring-0 focus:outline-none"
					/>
				</div>
				<hr class="my-2 text-zinc-500" />
				<button
					class="cursor-pointer rounded-md border-2 border-indigo-800 bg-indigo-500 px-4 py-2 hover:bg-indigo-600 text-sm"
					onclick={updateProfile}>Update</button
				>
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
