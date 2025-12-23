<script lang="ts">
	import type { EnhancerModifier } from '$lib/modifiers/basicModifiers';
	import type { ReforgeableModifier } from '$lib/modifiers/reforges';
	import { EmptyEquipment, Enhance, type Equipment } from '$lib/types/equipment';
	import { type Item } from '$lib/types/item';
	import { ConglomerateItems, previewEnhanceItem, reviveModifiers } from '$lib/utils/item';
	import { type MouseEventHandler } from 'svelte/elements';
	import FlexColContainer from './generic/flexContainers/flexColContainer.svelte';
	import Heading from './generic/heading.svelte';
	import SquareTextButton from './generic/squareTextButton.svelte';
	import ItemRenderer from './itemRenderer.svelte';
	import ItemSelectMenu from './itemSelectMenu.svelte';
	import { deepClone } from '$lib/utils/general';

	const {
		item,
		enhancer,
		equipment = EmptyEquipment,
		inventory = []
	}: {
		item: Item | undefined;
		enhancer: Item | undefined;
		equipment?: Equipment;
		inventory?: Item[];
	} = $props();

	function reforgeableFilter(item: Item): boolean {
		if (!selectedItem && !selectedEnhancer) {
			return item.modifiers.some((mod) => mod.type === 'Reforgeable');
		} else if (!selectedItem && selectedEnhancer) {
			const enhancerReforgeGroups: string[] = (
				selectedEnhancer.modifiers.find((m) => m.type === 'Enhancer') as EnhancerModifier
			).enhances;

			return (
				item.modifiers.some(
					(mod) =>
						mod.type === 'Reforgeable' &&
						(enhancerReforgeGroups.includes((mod as ReforgeableModifier).group) ||
							enhancerReforgeGroups.includes('any'))
				) && item.uid != selectedEnhancer.uid
			);
		} else {
			return false;
		}
	}

	function enhancerFilter(item: Item): boolean {
		console.log(item);
		if (selectedItem && !selectedEnhancer) {
			const affectedReforgeGroup: ReforgeableModifier = selectedItem?.modifiers.find(
				(mod) => mod.type === 'Reforgeable'
			) as ReforgeableModifier;
			return (
				item.modifiers.some(
					(mod) =>
						mod.type === 'Enhancer' &&
						((mod as EnhancerModifier).enhances.includes(affectedReforgeGroup.group) ||
							(mod as EnhancerModifier).enhances.includes('any'))
				) && item.uid != selectedItem.uid
			);
		} else {
			return item.modifiers.some((mod) => {
				console.log(mod.type);
				mod.type === 'Enhancer';
			});
		}
	}

	let selectMenuOpened: boolean = $state(false);
	let selectMenu: ItemSelectMenu;
	let mouseX: number = $state(0);
	let mouseY: number = $state(0);

	function toggleItem(item: Item | undefined) {
		selectedItem = item;
	}

	function toggleEnhancer(item: Item | undefined) {
		selectedEnhancer = item;
	}

	function selectItem(item: CustomEvent) {
		toggleItem(item.detail);
		selectMenuOpened = false;
	}

	function selectEnhancer(item: CustomEvent) {
		toggleEnhancer(item.detail);
		selectMenuOpened = false;
	}

	function toggleSelectMenu(e: MouseEvent) {
		selectMenuOpened = !selectMenuOpened;
		mouseX = e.clientX + 10;
		mouseY = e.clientY - 10;
	}

	let selectedItem: Item | undefined = $state<Item | undefined>(item);
	let selectedEnhancer: Item | undefined = $state(enhancer);

	let filter: (item: Item) => boolean = $state(reforgeableFilter);
	let onselect: (item: CustomEvent) => void = $state(selectItem);

	let output: Item | undefined = $derived.by(() => {
		if (selectedItem != undefined && selectedEnhancer != undefined) {
			return previewEnhanceItem(selectedItem, selectedEnhancer);
		}
	});

	let enhanceButtonDisabled: boolean = $derived.by(() => {
		return selectedEnhancer === undefined && selectedItem === undefined;
	});

	async function enhance(item: Item, enhancer: Item) {
		try {
			const newItem: Item | null = await Enhance(item, enhancer);

			if (newItem) {
				selectedItem = undefined;
				selectedEnhancer = undefined;

				output = deepClone<Item>(newItem) ?? newItem;
				output.modifiers = reviveModifiers(newItem.modifiers);
			}
		} catch (err) {
			console.error(err);
		}
	}
</script>

<FlexColContainer class="inline-flex items-center justify-start">
	<Heading class="text-center">Enhancer</Heading>
	<div class="m-2 grid grid-cols-3 grid-rows-2 gap-8 p-2">
		<div class="col-start-1 flex items-center justify-center">
			{@render itemSelectButton(
				selectedItem,
				'Item',
				(e) => {
					filter = reforgeableFilter;
					onselect = selectItem;
					toggleSelectMenu(e);
				},
				toggleItem
			)}
		</div>
		{#if output}
			<button
				class="ignore col-start-2 row-start-2 flex items-center justify-center p-2"
				onclick={(e) => {
					if (!selectedEnhancer && !selectedItem && output) {
						output = undefined;
					}
				}}
			>
				<ItemRenderer item={output} equippable={false} />
			</button>
		{:else}
			<SquareTextButton class="col-start-2 row-start-2" onclick={(e) => {}}>
				<span>Output</span>
			</SquareTextButton>
		{/if}
		<div class="col-start-3 flex items-center justify-center">
			{@render itemSelectButton(
				selectedEnhancer,
				'Enhancer',
				(e) => {
					filter = enhancerFilter;
					onselect = selectEnhancer;
					toggleSelectMenu(e);
				},
				toggleEnhancer
			)}
		</div>
	</div>
	<button
		disabled={enhanceButtonDisabled}
		onclick={async () => {
			if (selectedItem && selectedEnhancer) await enhance(selectedItem, selectedEnhancer);
		}}
	>
		Enhance
	</button>
</FlexColContainer>

{#if selectMenuOpened}
	<ItemSelectMenu
		allItems={ConglomerateItems(inventory ?? [], equipment ?? EmptyEquipment)}
		x={mouseX}
		y={mouseY}
		bind:this={selectMenu}
		on:select={onselect}
		{filter}
	/>
{/if}

{#snippet itemSelectButton(
	item: Item | undefined,
	buttonText: string,
	onclick: MouseEventHandler<HTMLButtonElement> | null | undefined,
	toggle: (item: Item | undefined) => void
)}
	{#if item}
		{#key item}
			<button onclick={(e) => toggle(undefined)} class="ignore">
				<ItemRenderer {item} equippable={false} />
			</button>
		{/key}
	{:else}
		<SquareTextButton
			class="flex aspect-square h-16 w-16 flex-col items-center justify-center"
			{onclick}
		>
			<span>Select</span>
			<span>{buttonText}</span>
		</SquareTextButton>
	{/if}
{/snippet}
