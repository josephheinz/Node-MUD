<script lang="ts">
	import { gameState, type Profile } from '$lib/store.svelte';
	import type { User } from '@supabase/supabase-js';
	import * as Avatar from '../avatar';
	import LoginDialog from './loginDialog.svelte';
	import Fa from 'svelte-fa';
	import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
	import UserAvatar from '../userAvatar.svelte';
	import { getProfile, getUser } from '$lib/remote/auth.remote';

	let user: User | null = $derived(gameState.user);
	let profile: Profile | null = $derived(gameState.profile);
</script>

<div class="flex w-full items-center justify-center py-2">
	<svelte:boundary>
		{#snippet pending()}
			<span>Loading</span>
		{/snippet}
		{#if (await getProfile()) && (await getUser())}
			<UserAvatar />
		{:else}
			<Fa icon={faUserCircle} size="lg" />
		{/if}
	</svelte:boundary>
</div>
