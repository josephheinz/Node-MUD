<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import { type Action, type ActionInput } from '$lib/types/action';
	import type { Inventory, Item } from '$lib/types/item';
	import { formatNumber } from '$lib/utils/general';
	import { getItem } from '$lib/utils/item';
	import numeral from 'numeral';
	import ItemHover from '../chat/itemHover.svelte';
	import { gameState } from '$lib/store.svelte';
	import { getInventoryCounts } from '$lib/utils/action';
	import Label from '../label/label.svelte';
	import Button from '../button/button.svelte';
	import { queueAction } from '$lib/remote/actions.remote';

	const { action }: { action: Action } = $props();

	let amount: number = $state(1);
	let timeAmount: number = $derived(action.time * amount);
	let inventory: Inventory = $derived(gameState.inventory);

	let loadedInputs: { item: Item; amount: number }[] = $derived(
		(Array.from(action.inputs)
			.map((i: ActionInput) => {
				const item = getItem(i.id);
				if (!item) return null;
				return { item, amount: i.amount * amount };
			})
			.filter(Boolean) as { item: Item; amount: number }[]) ?? []
	);
	let loadedOutputs: { item: Item; min: number; max: number; chance?: number }[] = $derived(
		action.outputs.items
			.map((o) => {
				const item = getItem(o.id);
				if (!item) return null;
				return { item, min: o.min * amount, max: o.max * amount, chance: o.chance };
			})
			.filter(Boolean) as { item: Item; min: number; max: number; chance?: number }[]
	);
	let inputsPresent = $derived.by(() => getInventoryCounts(inventory, loadedInputs));

	let canAct = $derived.by(() => {
		return loadedInputs.every((_, i) => inputsPresent[i].present >= inputsPresent[i].required);
	});
</script>

<Dialog.Content class="w-max min-w-72">
	<Dialog.Header>
		<Dialog.Title>{action.name}</Dialog.Title>
	</Dialog.Header>
	<form class="flex w-full flex-col gap-4" {...queueAction}>
		<div>
			<h1 class="text-start text-lg font-semibold">Inputs:</h1>
			<ul>
				{#each loadedInputs as { item, amount }, index}
					{@const itemsPresent = inputsPresent[index].present}
					<li class="flex items-start justify-start gap-2 pl-4">
						<span class={itemsPresent < amount ? 'text-rose-400' : ''}
							>{formatNumber(itemsPresent)}/{formatNumber(amount)}</span
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
			<h1 class="text-start text-lg font-semibold">Outputs:</h1>
			<ul>
				{#each loadedOutputs as { item, min, max, chance }, index}
					{@const chanceDecimal = chance ? 1 / (chance as number) : 1}
					{@const chancePercent = numeral(chanceDecimal).format('0[.][0000]%')}
					<li class="flex items-start justify-start gap-2 pl-4">
						<span
							>{min != max
								? `${formatNumber(min)} - ${formatNumber(max)}`
								: `${formatNumber(max)}`}</span
						>
						<ItemHover {item} />
						<span>{chancePercent == '100%' ? '' : chancePercent}</span>
					</li>
				{/each}
			</ul>
		</div>
		<span class="text-md">
			<b>Duration:</b>
			{Math.floor(timeAmount / 3600)}h {Math.floor((timeAmount % 3600) / 60)}m {timeAmount %
				60}s</span
		>
		<div class="flex gap-2">
			<Label for="amount" class="text-md font-semibold">Amount:</Label>
			<Input step={1} min={1} {...queueAction.fields.amount.as('number')} bind:value={amount} />
		</div>
		<input type="hidden" {...queueAction.fields.id.as('text')} value={action.id} />
		<Button class="cursor-pointer disabled:cursor-not-allowed" disabled={!canAct} type="submit"
			>Add to Queue</Button
		>
	</form>
</Dialog.Content>
