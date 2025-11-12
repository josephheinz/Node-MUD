<script lang="ts">
	import { getAction, type Action } from '$lib/types/action';
	import { onMount } from 'svelte';
	import ItemHover from '../chat/itemHover.svelte';
	import type { Item } from '$lib/types/item';
	import { getItem } from '$lib/types/item';
	import numeral from 'numeral';
	import { get } from 'svelte/store';
	import { actionQueue, user } from '$lib/store';

	let { action, amount = 1 }: { action: string; amount: number } = $props();

	let loadedAction: Action | null = $state(null);
	let loadedInputs: { item: Item; amount: number }[] = $state<{ item: Item; amount: number }[]>([]);
	let loadedOutputs: { item: Item; min: number; max: number; chance?: number }[] = $state<
		{ item: Item; min: number; max: number; chance?: number }[]
	>([]);
	onMount(() => {
		loadedAction = getAction(action);
		if (loadedAction) {
			loadedAction.inputs.ids.forEach((id) => {
				let loadedItem: Item | null = getItem(id);
				if (loadedItem) loadedInputs.push({ item: loadedItem, amount: amount });
			});

			loadedAction.outputs.items.forEach((output) => {
				let loadedItem: Item | null = getItem(output.id);
				if (loadedItem)
					loadedOutputs.push({
						item: loadedItem,
						min: output.min,
						max: output.max,
						chance: output.chance
					});
			});
		}
	});

	async function addToQueue() {
		let addFetch = await fetch(`/api/action/${get(user)?.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ actionID: action, amount: 1 })
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('HTTP Error');
				}

				return response.json();
			})
			.then((data) => {
				if (data.queue) {
					actionQueue.set(data.queue);
				}
			});
	}
</script>

{#if loadedAction}
	<div
		class="flex aspect-1/1 flex-col items-start justify-start gap-2 rounded-md border-2 border-zinc-700 bg-zinc-800 p-2"
	>
		<h1 class="w-full text-center text-xl font-bold">{loadedAction.name}</h1>
		<div>
			<h1>Inputs:</h1>
			<ul>
				{#each loadedInputs as { item, amount }}
					<li class="flex items-center justify-between gap-2">
						<b>{amount}</b>
						<ItemHover {item} />
					</li>
				{/each}
			</ul>
		</div>
		<div>
			<h1>Outputs:</h1>
			<ul>
				{#each loadedOutputs as { item, min, max, chance }}
					{@const chanceDecimal = chance ? 1 / (chance as number) : 1}
					{@const chancePercent = numeral(chanceDecimal).format('0[.][0000]%')}
					<li>
						<b>{min} - {max}</b>
						<ItemHover {item} />
						<span>{chancePercent == '100%' ? '' : chancePercent}</span>
					</li>
				{/each}
			</ul>
		</div>
		<span><b>Duration:</b> {loadedAction.time}s</span>
		<button
			class="m-auto cursor-pointer rounded-md border-2 border-indigo-700 bg-indigo-500 p-2 text-sm"
			onclick={addToQueue}
		>
			Add to Queue
		</button>
	</div>
{/if}
