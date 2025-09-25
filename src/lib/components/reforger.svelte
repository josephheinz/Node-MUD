<script lang="ts">
	import { ConglomerateItems, type Item } from '$lib/items';
	import { EmptyEquipment, type Equipment } from '$lib/types';
	import ItemRenderer from './itemRenderer.svelte';
	import ItemSelectMenu from './itemSelectMenu.svelte';

	const {
		item,
		equipment,
		inventory
	}: { item: Item | undefined; equipment: Equipment; inventory: Item[] } = $props();

	let selectedItem: Item | undefined = $state<Item | undefined>(item);
	let selectMenuOpened: boolean = $state(false);
	let selectMenu: ItemSelectMenu;
	let mouseX: number = $state(0);
	let mouseY: number = $state(0);

	function toggleItem(item: Item | undefined) {
		selectedItem = item;
	}

	function toggleSelectMenu(e: MouseEvent) {
		selectMenuOpened = !selectMenuOpened;
		mouseX = e.clientX;
		mouseY = e.clientY;
	}
</script>

<!--Menu to reforge an item-->
<div
	class="m-2 flex aspect-square h-72 flex-col items-center justify-center gap-8 rounded-md border-2 border-zinc-700 bg-zinc-800 p-8"
>
	<h1 class="text-2xl font-bold">Reforge Items</h1>
	{#if selectedItem}
		<button
			onclick={(e) => {
				toggleItem(undefined);
				toggleSelectMenu(e);
			}}
		>
			<ItemRenderer item={selectedItem} mode={'ascii'} pclass={''} equippedSlot={undefined} />
		</button>
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
		class="m-2 rounded-md border-2 border-zinc-500 bg-zinc-600 px-4 py-2 {selectedItem != undefined
			? 'cursor-pointer hover:border-zinc-300 hover:bg-zinc-400 hover:text-zinc-900'
			: 'cursor-not-allowed'}">Reforge</button
	>
</div>

{#if selectMenuOpened}
	<ItemSelectMenu
		open={selectMenuOpened}
		allItems={ConglomerateItems(inventory ?? [], equipment ?? EmptyEquipment)}
		x={mouseX}
		y={mouseY}
		bind:this={selectMenu}
		on:select={(item) => {
			toggleItem(item.detail);
			selectMenuOpened = false;
		}}
	/>
{/if}
