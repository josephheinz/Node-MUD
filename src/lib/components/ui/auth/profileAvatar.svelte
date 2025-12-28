<script lang="ts">
	import { gameState, type Profile } from '$lib/store.svelte';
	import type { User } from '@supabase/supabase-js';
	import * as Avatar from '../avatar';
	import LoginDialog from './loginDialog.svelte';
	import Fa from 'svelte-fa';
	import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

	let user: User | null = $derived(gameState.user);
	let profile: Profile | null = $derived(gameState.profile);
</script>

<div class="flex w-full items-center justify-center py-2">
	{#if profile && user}
		<Avatar.Root>
			<Avatar.Image src={profile.profile_picture} />
			<Avatar.AvatarFallback>{profile.display_name.substring(0, 2)}</Avatar.AvatarFallback>
		</Avatar.Root>
	{:else}
		<Fa icon={faUserCircle} size="lg" />
	{/if}
</div>
