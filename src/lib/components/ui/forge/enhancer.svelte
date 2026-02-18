<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronsUpDown, Merge } from '@lucide/svelte';
	import { buttonVariants } from '../button';
	import Button from '../button/button.svelte';
	import { type Item } from '$lib/types/item';
	import ItemRenderer from '../itemRenderer.svelte';
	import ItemSelectMenu from '$lib/components/itemSelectMenu.svelte';
	import type { ReforgeableModifier } from '$lib/modifiers/reforges';
	import type { EnhancerModifier } from '$lib/modifiers/basicModifiers';
	import { previewEnhanceItem } from '$lib/utils/item';
	import { type MouseEventHandler } from 'svelte/elements';
	import { getInventory } from '$lib/remote/inventory.remote';
	import { getEquipment } from '$lib/remote/equipment.remote';

	let enhancer: Item | undefined;
	let item: Item | undefined;

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
			return item.modifiers.some((mod) => mod.type === 'Enhancer');
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
</script>

<Collapsible.Root class="w-full p-0" open={true}>
	<Card.Root class="w-full p-2 px-0">
		<div class="flex items-center justify-between space-x-4 px-4">
			<span class="text-xl font-semibold">Enhancer</span>
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', class: 'w-9 p-0' })}>
				<ChevronsUpDown size="24" />
			</Collapsible.Trigger>
		</div>
		<Collapsible.Content>
			<Card.Content>
				<div class="flex flex-col items-center justify-center gap-4">
					<div class="grid grid-cols-3 grid-rows-2 gap-2">
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

						<div class="flex size-full items-center justify-center">
							<Merge size="32" class="rotate-180" />
						</div>

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

						{#if output}
							<ItemRenderer item={output} />
						{:else}
							<div
								class="col-start-2 flex size-16 items-center justify-center rounded-md border-2 border-border bg-border p-2 text-xs select-none"
							>
								Output
							</div>
						{/if}
					</div>
					<Button>Enhance</Button>
				</div>
			</Card.Content>
		</Collapsible.Content>
	</Card.Root>
</Collapsible.Root>

{#if selectMenuOpened}
	{@const allItems = [...(await getInventory()).contents, ...(await getEquipment()).toArray()]}
	<ItemSelectMenu
		items={allItems}
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
				<ItemRenderer {item} />
			</button>
		{/key}
	{:else}
		<button
			class="flex size-16 flex-col items-center justify-center rounded-md border-2 border-border bg-border p-2 text-xs select-none"
			{onclick}
		>
			<span>Select</span>
			<span>{buttonText}</span>
		</button>
	{/if}
{/snippet}
