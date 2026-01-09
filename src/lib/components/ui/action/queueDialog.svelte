<script lang="ts">
	import type { Action } from '$lib/types/action';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Empty from '$lib/components/ui/empty';
	import Fa from 'svelte-fa';
	import { faLocust } from '@fortawesome/free-solid-svg-icons';
	import { formatNumber } from '$lib/utils/general';
	import { loadDbQueue } from '$lib/utils/action';
	import { getQueue } from '$lib/remote/actions.remote';

	let loadedQueuePromise = $derived(getQueue());
	let loadedQueue = $derived(loadDbQueue((await loadedQueuePromise).queue));
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title>Your Queue</Dialog.Title>
	</Dialog.Header>
	{#if loadedQueue.size > 0}
		{@render queueNotEmpty()}
	{:else}
		{@render queueEmpty()}
	{/if}
</Dialog.Content>

{#snippet queueNotEmpty()}
	<svelte:boundary>
		{#snippet pending()}
			<span>Loading queue</span>
		{/snippet}
		{@const queue = (await getQueue()).queue}
		{@const currentAction: Action = loadedQueue.entries().next().value?.[1]!}
		{@const currentIndex: number = loadedQueue.entries().next().value?.[0]!}
		<div class="flex flex-col items-start justify-start gap-2">
			<span class="text-sm text-card-foreground"
				>Current action: {formatNumber(queue[currentIndex].amount)} {currentAction.name}</span
			>
		</div>
		{#if loadedQueue.size > 1}
			<span>Upcoming actions: </span>
			<div class="flex flex-col items-start justify-start gap-1">
				{#each loadedQueue.entries() as [index, action]}
					{#if index !== currentIndex}
						<span class="text-sm text-muted-foreground"
							>{action.name} x{formatNumber(queue[index].amount)}
						</span>
					{/if}
				{/each}
			</div>
		{/if}
	</svelte:boundary>
{/snippet}

{#snippet queueEmpty()}
	<Empty.Root class="w-full md:p-0">
		<Empty.Header class="p-0">
			<Empty.Media>
				<Fa icon={faLocust} class="text-2xl" />
			</Empty.Media>
			<Empty.Title>Your queue is empty</Empty.Title>
			<Empty.Description>Try queueing something</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/snippet}
