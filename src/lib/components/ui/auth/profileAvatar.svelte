<script lang="ts">
	import { gameState, type Profile } from '$lib/store.svelte';
	import type { User } from '@supabase/supabase-js';
	import * as Avatar from '../avatar';
	import LoginDialog from './loginDialog.svelte';
	import Fa from 'svelte-fa';
	import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
	import UserAvatar from '../userAvatar.svelte';

	let user: User | null = $derived(gameState.user);
	let profile: Profile | null = $derived(gameState.profile);
</script>

<div class="flex w-full items-center justify-center py-2">
	{#if profile && user}
		<UserAvatar {profile} />
	{:else}
		<Fa icon={faUserCircle} size="lg" />
	{/if}
</div>
