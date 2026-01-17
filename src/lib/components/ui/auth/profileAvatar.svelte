<script lang="ts">
	import UserAvatar from '../userAvatar.svelte';
	import { getProfile, getUser } from '$lib/remote/auth.remote';
	import { CircleUserRound } from '@lucide/svelte';
</script>

<div class="flex w-full items-center justify-center py-2">
	<svelte:boundary>
		{#snippet pending()}
			<span>Loading</span>
		{/snippet}
		{#if (await getProfile()) && (await getUser())}
			<UserAvatar />
		{:else}
			<CircleUserRound size="24" />
		{/if}
	</svelte:boundary>
</div>
