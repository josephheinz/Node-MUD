<script lang="ts">
	import type { DBQueueAction } from '$lib/types/action';
	import { faTrash, faX } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import FlexColContainer from '../generic/flexContainers/flexColContainer.svelte';
	import FlexContainer from '../generic/flexContainers/flexContainer.svelte';

	const {
		queue = $bindable(),
		open = $bindable(),
		onClose
	}: { queue: DBQueueAction[]; open: boolean; onClose: () => void } = $props();

	async function popFromQueue(index: number): Promise<void> {
		const updatedQueue: DBQueueAction[] = queue.toSpliced(index, 1);

		await updateQueue(updatedQueue);
	}

	async function updateQueue(updatedQueue: DBQueueAction[]): Promise<void> {
		try {
			await fetch(`/api/action/${get(store.profile)?.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ updatedQueue })
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('HTTP Error!');
					}

					return response.json();
				})
				.then((data) => {
					if (data.queue) {
						store.actionQueue.set(data.queue);
					}
				});
		} catch (err) {
			throw new Error(`${JSON.stringify(err)}`);
		}
	}
</script>

{#if open === true}
	<div class="absolute flex size-full items-center justify-center backdrop-blur-sm">
		<FlexColContainer class="relative size-1/3 items-start justify-stretch">
			<button onclick={onClose} class="ignore absolute top-2 right-2 cursor-pointer"
				><Fa icon={faX} /></button
			>
			<h1 class="text-xl font-semibold">Your Queue</h1>
			<hr />
			{#if queue.length === 0}
				<span class="m-auto">Queue empty</span>
			{:else}
				<ul class="flex w-full flex-col gap-2">
					{#each queue as action, index}
						<li>
							{#if index === 0}
								<b>Current Action:</b><br />
							{/if}
							{@render queueAction(action, index)}
						</li>
					{/each}
				</ul>
			{/if}
		</FlexColContainer>
	</div>
{/if}

{#snippet queueAction(action: DBQueueAction, index: number)}
	<div class="flex w-full items-center justify-between">
		<span class="ml-2 select-none">{action.action.name} x{action.amount}</span>
		<button
			class="cursor-pointer text-rose-400"
			onclick={async () => {
				await popFromQueue(index);
			}}><Fa icon={faTrash} /></button
		>
	</div>
{/snippet}
