<script lang="ts">
	import { type Item } from '$lib/types/item';
	import { type Equipment, EmptyEquipment, Reforge } from '$lib/types/equipment';
	import ItemRenderer from './itemRenderer.svelte';
	import ItemSelectMenu from './itemSelectMenu.svelte';
	import { ConglomerateItems, reviveModifiers } from '$lib/utils/item';
	import { deepClone } from '$lib/utils/general';

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
<div
	class="m-2 flex aspect-square h-72 flex-col items-center justify-center gap-8 rounded-md border-2 border-zinc-700 bg-zinc-800 p-8"
>
	<h1 class="text-2xl font-bold">Reforge Items</h1>
	{#if selectedItem}
		{#key selectedItem}
			<button
				onclick={(e) => {
					toggleItem(undefined);
				}}
			>
				<ItemRenderer item={selectedItem} equippable={false} />
			</button>
		{/key}
	{:else}
		<button
			class="flex aspect-square h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 text-sm select-none"
			onclick={(e) => toggleSelectMenu(e)}
		>
			<span>Select</span>
			<span>Item</span>
		</button>
	{/if}
	<button
		disabled={selectedItem == undefined}
		onclick={async () => {
			if (selectedItem) await reforge(selectedItem);
		}}
		class="m-2 rounded-md border-2 border-zinc-500 bg-zinc-600 px-4 py-2 {selectedItem != undefined
			? 'cursor-pointer hover:border-zinc-300 hover:bg-zinc-400 hover:text-zinc-900'
			: 'cursor-not-allowed'}">Reforge</button
	>
</div>

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
