<script lang="ts">
	import { getProfile } from '$lib/remote/auth.remote';
	import * as Card from './card';
	import Skeleton from './skeleton/skeleton.svelte';
	import UserAvatar from './userAvatar.svelte';
</script>

<svelte:boundary>
	{#snippet pending()}
		<Card.Root>
			<div class="flex flex-col items-center justify-around gap-4 px-4">
				<Skeleton class="size-24 rounded-full" />
				<Skeleton class="h-8 w-56 rounded-md" />
			</div>
		</Card.Root>
	{/snippet}
	{@const profile = await getProfile()}
	<Card.Root>
		<Card.Content class="flex flex-col items-center justify-around gap-4">
			{#if profile}
				<UserAvatar class="aspect-square size-24" />
				<h1 class="text-2xl font-bold text-card-foreground">
					Welcome back, {profile.display_name ?? profile.username}!
				</h1>
			{/if}
		</Card.Content>
	</Card.Root>
</svelte:boundary>
