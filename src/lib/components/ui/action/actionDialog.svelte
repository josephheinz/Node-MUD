<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import { type Action, type ActionInput } from '$lib/types/action';
	import type { Item } from '$lib/types/item';
	import { formatNumber } from '$lib/utils/general';
	import { getItem } from '$lib/utils/item';
	import numeral from 'numeral';
	import ItemHover from '../chat/itemHover.svelte';

	const { action }: { action: Action } = $props();

	let amount: number = $state(1);
	let timeAmount: number = $derived(action.time * amount);

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
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title>{action.name}</Dialog.Title>
	</Dialog.Header>
	<div class="flex w-full flex-col gap-2">
		<div>
			<h1 class="text-start text-lg font-semibold">Inputs:</h1>
			<ul>
				{#each loadedInputs as { item, amount }, index}
					<li class="flex items-start justify-start gap-2 pl-4">
						<span>{formatNumber(amount)}</span>
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
		<Input type="number" bind:value={amount} step={1} min={1} />
	</div>
</Dialog.Content>
