<script lang="ts">
	import { gameState, type Profile } from '$lib/store.svelte';
	import type { User } from '@supabase/supabase-js';
	import ProfileDropdown from './profileDropdown.svelte';
	import LoginDialog from './loginDialog.svelte';

	let user: User | null = $derived(gameState.user);
	let profile: Profile | null = $derived(gameState.profile);
</script>

{#if profile && user}
	<ProfileDropdown {profile} />
{:else}
	<LoginDialog />
{/if}
