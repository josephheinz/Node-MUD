<script lang="ts">
	import { getAction, type Action } from '$lib/types/action';
	import { getItem, type Item } from '$lib/types/item';
	import { getInventoryCounts } from '$lib/utils/action';
	import { faX } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import ItemHover from '../chat/itemHover.svelte';
	import numeral from 'numeral';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import NumberInput from '../NumberInput.svelte';

	let action: string = $state(get(store.actionModalData).action);
	let amount: number = $state(1);
	let inventory: Item[] = $state(get(store.inventory));
	let isVisible: boolean = $state(get(store.actionModalData).visible);

	let loadedAction: Action | null = $derived(getAction(action));

	let loadedInputs = $derived.by(() => {
		if (!loadedAction) return [];
		if (!loadedAction.inputs || !loadedAction.inputs.ids || !loadedAction.inputs.amounts) return [];

		return (
			(loadedAction.inputs.ids
				.map((id, i) => {
					const item = getItem(id);
					if (!item) return null;
					return { item, amount: loadedAction.inputs.amounts[i] * amount };
				})
				.filter(Boolean) as { item: Item; amount: number }[]) ?? []
		);
	});

	let loadedOutputs = $derived.by(() => {
		if (!loadedAction) return [];
		if (!loadedAction.outputs) return [];

		return (
			(loadedAction.outputs.items
				.map((o) => {
					const item = getItem(o.id);
					if (!item) return null;
					return { item, min: o.min * amount, max: o.max * amount, chance: o.chance };
				})
				.filter(Boolean) as { item: Item; min: number; max: number; chance?: number }[]) ?? []
		);
	});

	let inputsPresent = $derived.by(() => getInventoryCounts(inventory, loadedInputs));

	let canAct = $derived.by(() =>
		loadedInputs.every((_, i) => inputsPresent[i].present >= inputsPresent[i].required)
	);

	async function addToQueue() {
		loadedInputs.forEach((_, index) => {
			if (inputsPresent[index].present < inputsPresent[index].required * amount) return;
		});

		const now: number = Date.now();

		let addFetch = await fetch(`/api/action/${get(store.user)?.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ actionID: action, amount })
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('HTTP Error');
				}

				return response.json();
			})
			.then((data) => {
				if (data.queue) {
					store.actionQueue.set(data.queue);
					if (!get(store.queueActive)) {
						store.queueStart.set(now);
						store.queueEnd.set(now + (loadedAction?.time ?? 0) * 1000);
						store.queueActive.set(true);
					}
				}
				if (data.inventory) {
					store.inventory.set(data.inventory);
				}
			})
			.finally(() => {
				store.actionModalData.set({ action, visible: false, amount });
			});
	}

	store.actionModalData.subscribe((value) => {
		action = value.action;
		isVisible = value.visible;
		amount = value.amount;
	});

	store.inventory.subscribe((value) => (inventory = value));
</script>

{#if loadedAction && isVisible}
	<div
		class="absolute z-100 flex size-full items-center justify-center backdrop-blur-sm select-none"
	>
		<div
			class="h-content w-content relative flex flex-col items-center justify-center gap-4 rounded-md border-2 border-zinc-700 bg-zinc-800 px-8 py-4"
		>
			<button class="absolute top-2 right-2 cursor-pointer" onclick={() => (isVisible = false)}
				><Fa icon={faX} /></button
			>
			<h1 class="w-full text-center text-xl font-bold">{loadedAction?.name ?? 'Loading'}</h1>
			<div>
				<h1 class="text-center text-lg font-semibold">Inputs:</h1>
				<ul>
					{#each loadedInputs as { item, amount }, index}
						{@const itemsPresent = inputsPresent[index].present}
						<li class="flex items-center justify-between gap-2 pl-4">
							<span class={itemsPresent < amount ? 'text-rose-400' : ''}
								>{itemsPresent}/{amount}</span
							>
							<ItemHover {item} />
						</li>
					{/each}
					{#if loadedInputs.length == 0}
						<li>None</li>
					{/if}
				</ul>
			</div>
			<div>
				<h1 class="text-center text-lg font-semibold">Outputs:</h1>
				<ul>
					{#each loadedOutputs as { item, min, max, chance }}
						{@const chanceDecimal = chance ? 1 / (chance as number) : 1}
						{@const chancePercent = numeral(chanceDecimal).format('0[.][0000]%')}
						<li class="flex items-center justify-between gap-2 pl-4">
							<span>{min != max ? `${min} - ${max}` : `${max}`}</span>
							<ItemHover {item} />
							<span>{chancePercent == '100%' ? '' : chancePercent}</span>
						</li>
					{/each}
				</ul>
			</div>
			<span class="text-md"><b>Duration:</b> {numeral(loadedAction.time * amount).format("[00:][00:]00")}s</span>
			<span><b>Amount: </b><NumberInput bind:value={amount} min={1} max={1000} step={1} /></span>
			<button
				class="m-auto cursor-pointer rounded-md border-2 border-indigo-700 bg-indigo-500 p-2 text-sm
			disabled:cursor-not-allowed disabled:border-zinc-900 disabled:bg-zinc-700 disabled:text-zinc-500"
				onclick={addToQueue}
				disabled={!canAct}
			>
				Add to Queue
			</button>
		</div>
	</div>
{/if}
