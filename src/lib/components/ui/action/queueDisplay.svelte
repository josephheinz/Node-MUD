<script lang="ts">
	import { type Action, type DBQueueAction } from '$lib/types/action';
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
	import type { DBItem } from '$lib/types/item';

	type QueueData = {
		queue: DBQueueAction[];
		currentActionStartedAt: number | null;
		completed: {
			actionId: string;
			amount: number;
			outputs: {
				items: DBItem[];
			};
		}[];
		progress: number;
		nextPollIn: number | null;
		estimatedCompletion: number | null;
		currentActionDuration: number | null;
	};
</script>

<svelte:boundary>
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
	{@const queue = await getQueue()}
	<Dialog.Root>
		<Card.Root class="h-64 select-none">
			<Dialog.Trigger class="w-full text-left">
				<Card.Header class="w-full cursor-pointer">
					<Card.Title>Action Queue</Card.Title>
				</Card.Header>
			</Dialog.Trigger>
			{#if queue.queue.length === 0}
				{@render queueEmpty()}
			{:else}
				{@render queueNotEmpty(queue)}
			{/if}
		</Card.Root>
	</Dialog.Root>
</svelte:boundary>

{#snippet queueNotEmpty(queue: QueueData)}
	<Card.Content>
		
	</Card.Content>
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
