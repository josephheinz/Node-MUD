<script lang="ts">
	import ProfileDropdown from './profileDropdown.svelte';
	import { getProfile, getUser } from '$lib/remote/auth.remote';
	import { Skeleton } from '$lib/components/ui/skeleton/index';
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="flex h-max w-full justify-start gap-4 px-4">
			<Skeleton class="size-8 rounded-full" />
			<Skeleton class="h-4/5 grow rounded-full" />
		</div>
	{/snippet}
	{#if (await getProfile()) && (await getUser())}
		<ProfileDropdown />
	{/if}
</svelte:boundary>
