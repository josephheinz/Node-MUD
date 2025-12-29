<script lang="ts">
	import { gameState, type Profile } from '$lib/store.svelte';
	import * as Card from './card';
	import * as Avatar from './avatar';
	import UserAvatar from './userAvatar.svelte';

	let profile: Profile | null = $state(gameState.profile);

	$effect(() => {
		profile = gameState.profile;
	});
</script>

<Card.Root>
	<Card.Content class="flex flex-col items-center justify-around gap-4">
		{#if profile !== null}
			<UserAvatar {profile} class="aspect-square size-24" />
			<h1 class="text-2xl font-bold text-card-foreground">
				Welcome back, {profile.display_name ?? profile.username}!
			</h1>
		{:else}
			<h1 class="text-2xl font-bold text-card-foreground">Sign up or login</h1>
		{/if}
	</Card.Content>
</Card.Root>
