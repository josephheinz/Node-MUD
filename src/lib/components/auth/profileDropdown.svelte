<script lang="ts">
	import Fa from 'svelte-fa';
	import { faRightFromBracket, faUser, faGear } from '@fortawesome/free-solid-svg-icons';
	import type { User } from '@supabase/supabase-js';
	let { user }: { user: User } = $props();

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
				window.location.reload();
			})
			.catch((error) => {
				console.error(error);
			});
	}
</script>

<div class="">
	<button
		class="flex items-start justify-around gap-2 {opened == true
			? 'rounded-t-md'
			: 'rounded-md'} w-48 cursor-pointer border-2 border-zinc-700 bg-zinc-800 p-2"
		aria-haspopup="menu"
		aria-expanded={opened}
		onclick={() => (opened = !opened)}
	>
		<img
			src={user.user_metadata?.avatar_url ?? '/images/blank_pfp.webp'}
			alt="Profile"
			class="h-12 rounded-full"
		/>
		<b>{displayName}</b>
	</button>

	<!-- Dropdown menu -->
	{#if opened}
		<div
			role="menu"
			class="w-48 rounded-b-md border-2 border-t-0 border-zinc-700 bg-zinc-800 shadow-lg"
		>
			<a
				href="/profile/{user.user_metadata?.full_name}"
				role="menuitem"
				class="flex w-full cursor-pointer items-center justify-start gap-2 px-4 py-2 text-left hover:bg-zinc-500"
				><Fa icon={faUser} /> Profile
			</a>
			<a
				href="/profile/{user.user_metadata?.full_name}/settings"
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
</div>
