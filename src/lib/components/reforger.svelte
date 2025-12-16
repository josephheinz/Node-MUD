<script lang="ts">
	import { getItemData, type Item } from '$lib/types/item';
	import { type Equipment, EmptyEquipment, Reforge } from '$lib/types/equipment';
	import ItemRenderer from './itemRenderer.svelte';
	import ItemSelectMenu from './itemSelectMenu.svelte';
	import { ConglomerateItems, reviveModifiers } from '$lib/utils/item';
	import { deepClone } from '$lib/utils/general';
	import Container from './generic/container.svelte';
	import Heading from './generic/heading.svelte';
	import FlexColContainer from './generic/flexContainers/flexColContainer.svelte';
	import SquareTextButton from './generic/squareTextButton.svelte';

	const {
		item,
		equipment = EmptyEquipment,
		inventory = []
	}: { item: Item | undefined; equipment?: Equipment; inventory?: Item[] } = $props();

	let selectedItem: Item | undefined = $state<Item | undefined>(item);
	let selectedItemInventoryId: number = inventory.findIndex(
		(item) => item.uid === selectedItem?.uid
	);
	let selectMenuOpened: boolean = $state(false);
	let selectMenu: ItemSelectMenu;
	let mouseX: number = $state(0);
	let mouseY: number = $state(0);

	function toggleItem(item: Item | undefined) {
		selectedItem = item;
	}

	function toggleSelectMenu(e: MouseEvent) {
		selectMenuOpened = !selectMenuOpened;
		mouseX = e.clientX + 10;
		mouseY = e.clientY - 10;
	}

	function reforgeableFilter(item: Item): boolean {
		return item.modifiers.some((mod) => mod.type === 'Reforgeable');
	}

	async function reforge(item: Item) {
		try {
			const newItem: Item | null = await Reforge(item);
			if (newItem) {
				selectedItem = deepClone<Item>(newItem) ?? newItem;
				selectedItem.modifiers = reviveModifiers(selectedItem.modifiers);
			}
		} catch (err) {
			console.error(err);
		}
	}
</script>

<!--Menu to reforge an item-->
<FlexColContainer class="aspect-square h-72 items-center justify-around p-8">
	<Heading>Reforge Items</Heading>
	{#if selectedItem}
		{#key selectedItem}
			<button
				onclick={(e) => {
					toggleItem(undefined);
				}}
				class="ignore"
			>
				<ItemRenderer item={selectedItem} equippable={false} />
			</button>
			<span>{getItemData(selectedItem).title}</span>
		{/key}
	{:else}
		<SquareTextButton
			class="flex aspect-square h-16 w-16 flex-col items-center justify-center"
			onclick={(e) => toggleSelectMenu(e)}
		>
			<span>Select</span>
			<span>Item</span>
		</SquareTextButton>
	{/if}
	<button
		disabled={selectedItem == undefined}
		onclick={async () => {
			if (selectedItem) await reforge(selectedItem);
		}}
		class={selectedItem != undefined
			? 'cursor-pointer hover:border-zinc-300 hover:bg-zinc-400 hover:text-zinc-900'
			: 'cursor-not-allowed'}>Reforge</button
	>
</FlexColContainer>

{#if selectMenuOpened}
	<ItemSelectMenu
		allItems={ConglomerateItems(inventory ?? [], equipment ?? EmptyEquipment)}
		x={mouseX}
		y={mouseY}
		bind:this={selectMenu}
		on:select={(item) => {
			toggleItem(item.detail);
			selectMenuOpened = false;
		}}
		filter={reforgeableFilter}
	/>
{/if}
