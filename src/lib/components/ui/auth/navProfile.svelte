<script lang="ts">
	import ProfileDropdown from './profileDropdown.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index';
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="flex h-10 w-full justify-start gap-4 px-4">
			<Skeleton class="aspect-square h-full rounded-full" />
			<Skeleton class="h-4/5 grow rounded-full" />
		</div>
	{/snippet}
	<ProfileDropdown />
</svelte:boundary>
