<script lang="ts">
	import Fa from 'svelte-fa';
	import { faRightFromBracket, faUser, faGear } from '@fortawesome/free-solid-svg-icons';
	let { user } = $props();

	let opened = $state(false);
	let displayName =
		user.user_metadata?.full_name ?? user.user_metadata?.display_name ?? user.email?.split('@')[0];

	async function signout() {
		let trySignOut = await fetch('/api/auth/signout', {
			method: 'POST'
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Signout error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				console.log('Success');
				window.location.reload();
			})
			.catch((error) => {
				console.error(error);
			});
	}
</script>

<button
	class="flex items-start justify-around gap-2 {opened == true
		? 'rounded-t-md'
		: 'rounded-md'} w-48 bg-zinc-700 p-2"
	aria-haspopup="menu"
	aria-expanded={opened}
	onclick={() => (opened = !opened)}
>
	<img
		src={user.user_metadata?.avatar_url ?? 'https://avatar.iran.liara.run/public/30'}
		alt="Profile"
		class="h-12 rounded-full"
	/>
	<b>{displayName}</b>
</button>

<!-- Dropdown menu -->
{#if opened}
	<div role="menu" class="w-48 rounded-b-md bg-zinc-600 shadow-lg">
		<a
			href="#"
			role="menuitem"
			class="flex w-full cursor-pointer items-center justify-start gap-2 px-4 py-2 text-left hover:bg-zinc-500"
			><Fa icon={faUser} /> Profile
		</a>
		<a
			href="#"
			role="menuitem"
			class="flex w-full cursor-pointer items-center justify-start gap-2 px-4 py-2 text-left hover:bg-zinc-500"
			><Fa icon={faGear} /> Settings
		</a>
		<button
			role="menuitem"
			class="flex w-full cursor-pointer items-center justify-start gap-2 rounded-b-md px-4 py-2 text-left hover:bg-zinc-500"
			onclick={signout}
		>
			<Fa icon={faRightFromBracket} /> Sign Out
		</button>
	</div>
{/if}

<!--
{#if opened}
	<a
		href="#"
		onclick={() => (opened = false)}
		class="inline-flex cursor-pointer flex-col gap-2 rounded-md bg-zinc-700 p-2"
	>
		<div class="flex gap-2">
			<img
				class="h-12"
				src={user.user_metadata?.avatar_url ?? 'https://avatar.iran.liara.run/public/30'}
				alt="User's avatar"
			/>
			<div class="flex h-full flex-col items-start justify-between">
				<b class="text-lg">{displayName}</b>
				<span class="text-sm">{user.email}</span>
			</div>
		</div>
		<button
			class="m-auto inline-flex w-9/10 cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-300 p-2 text-black"
			><Fa icon={faRightFromBracket} /> Sign Out</button
		>
	</a>
    
{:else}
	<a
		href="#"
		onclick={() => (opened = true)}
		class="inline-flex cursor-pointer gap-2 rounded-md bg-zinc-700 p-2"
	>
		<img
			class="h-12"
			src={user.user_metadata?.avatar_url ?? 'https://avatar.iran.liara.run/public/30'}
			alt="User's avatar"
		/>
		<div class="flex h-full flex-col items-start justify-between">
			<b class="text-lg">{displayName}</b>
			--><!--<span class="text-sm">{user.email}</span>
		</div>
	</a>
{/if}-->
