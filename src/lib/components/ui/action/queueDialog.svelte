<script lang="ts">
	import type { Action, DBQueueAction } from '$lib/types/action';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Empty from '$lib/components/ui/empty';
	import Fa from 'svelte-fa';
	import { faLocust } from '@fortawesome/free-solid-svg-icons';
	import { formatNumber } from '$lib/utils/general';

	const {
		queue,
		started,
		loadedQueue
	}: { queue: DBQueueAction[]; started: Date; loadedQueue: Map<number, Action> } = $props();
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
	{@const currentAction: Action = loadedQueue.entries().next().value?.[1]!}
	{@const currentIndex: number = loadedQueue.entries().next().value?.[0]!}
	<div class="flex flex-col items-start justify-start gap-2">
		<span class="text-sm text-card-foreground"
			>Current action: {formatNumber(queue[currentIndex].amount)} {currentAction.name}</span
		>
	</div>
	{#if loadedQueue.size > 1}
		<span>Upcoming actions: </span>
		{#each loadedQueue.entries() as [index, action]}
			{#if index !== currentIndex}
				<div class="flex flex-col items-start justify-start text-xs text-muted-foreground">
					<span
						>{action.name} x{formatNumber(queue[index].amount)}
						<Dialog.Trigger class="rounded-sm border-1 border-ring px-1"
							>&bullet;&bullet;&bullet;</Dialog.Trigger
						></span
					>
				</div>
			{/if}
		{/each}
	{/if}
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
