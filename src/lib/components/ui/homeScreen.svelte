<script lang="ts">
	import { gameState, type Profile } from '$lib/store.svelte';
	import * as Card from './card';
	import * as Avatar from './avatar';

	let profile: Profile | null = $state(gameState.profile);

	$effect(() => {
		profile = gameState.profile;
	});
</script>

<Card.Root>
	<Card.Content class="flex flex-col items-center justify-around gap-4">
		{#if profile !== null}
			<Avatar.Root class="aspect-square size-24">
				<Avatar.AvatarImage src={profile.profile_picture} />
				<Avatar.AvatarFallback>{profile.display_name.substring(0, 2)}</Avatar.AvatarFallback>
			</Avatar.Root>
			<h1 class="text-2xl font-bold text-card-foreground">Welcome back, {profile.display_name}!</h1>
		{:else}
			<h1 class="text-2xl font-bold text-card-foreground">Sign up or login</h1>
		{/if}
	</Card.Content>
</Card.Root>
