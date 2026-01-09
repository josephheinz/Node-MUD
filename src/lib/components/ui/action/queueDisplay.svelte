<script lang="ts">
	import { type Action } from '$lib/types/action';
	import * as Card from '../card';
	import * as Dialog from '$lib/components/ui/dialog';
	import QueueDialog from './queueDialog.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { faLocust } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { formatNumber } from '$lib/utils/general';
	import QueueProgressBar from './queueProgressBar.svelte';
	import { loadDbQueue } from '$lib/utils/action';
	import { getQueue } from '$lib/remote/actions.remote';
	import Skeleton from '../skeleton/skeleton.svelte';
</script>

<svelte:boundary>
	{@const loadedQueue = loadDbQueue((await getQueue()).queue)}
	{#snippet pending()}
		<Card.Root class="h-max max-h-64 select-none">
			<Card.Header class="w-full cursor-pointer">
				<Card.Title>Loading Queue...</Card.Title>
			</Card.Header>
			<Card.Content>
				<Skeleton class="h-26 w-full" />
			</Card.Content>
		</Card.Root>
	{/snippet}
	<Dialog.Root>
		<Card.Root class="h-max max-h-64 select-none">
			<Dialog.Trigger class="w-full text-left">
				<Card.Header class="w-full cursor-pointer">
					<Card.Title>Action Queue</Card.Title>
				</Card.Header>
			</Dialog.Trigger>
			{#if loadedQueue.size > 0}
				{@render queueNotEmpty()}
			{:else}
				{@render queueEmpty()}
			{/if}
		</Card.Root>
		<QueueDialog />
	</Dialog.Root>
</svelte:boundary>

{#snippet queueNotEmpty()}
	{@const queue = (await getQueue()).queue}
	{@const loadedQueue = loadDbQueue((await getQueue()).queue)}

	{@const currentAction: Action = loadedQueue.entries().next().value?.[1]!}
	{@const currentIndex: number = loadedQueue.entries().next().value?.[0]!}

	{@const nextAction : Action | undefined = loadedQueue.entries().next().value?.[1]}
	{@const nextIndex : number | undefined = loadedQueue.entries().next().value?.[0]}
	<Card.Content class="flex flex-col items-start justify-start gap-2">
		<QueueProgressBar queueData={await getQueue()} />
		<span class="text-sm text-card-foreground"
			>{formatNumber(queue[currentIndex].amount)} {currentAction.name}</span
		>
	</Card.Content>
	{#if nextAction && nextIndex}
		<Card.Footer class="flex flex-col items-start justify-start text-xs text-muted-foreground">
			<span>Upcoming actions: </span>
			<span
				>{nextAction.name} x{formatNumber(queue[nextIndex].amount)}
				<Dialog.Trigger class="rounded-sm border-1 border-ring px-1"
					>&bullet;&bullet;&bullet;</Dialog.Trigger
				></span
			>
		</Card.Footer>
	{/if}
{/snippet}

{#snippet queueEmpty()}
	<Empty.Root class="w-full md:p-0">
		<Empty.Header>
			<Empty.Media>
				<Fa icon={faLocust} class="text-2xl" />
			</Empty.Media>
			<Empty.Title>Your queue is empty</Empty.Title>
			<Empty.Description>Try queueing something</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/snippet}
