<script lang="ts">
	import { ConglomerateItems, type Item } from '$lib/items';
	import type { Equipment } from '$lib/types';
	import ItemRenderer from './itemRenderer.svelte';
	import ItemSelectMenu from './itemSelectMenu.svelte';

	const {
		selectedItem,
		equipment,
		inventory
	}: { selectedItem: Item | undefined; equipment: Equipment; inventory: Item[] } = $props();

	let selectMenuOpened: boolean = $state(false);
</script>

<!--Menu to reforge an item-->
<div
	class="m-2 flex aspect-square h-72 flex-col items-center justify-center gap-8 rounded-md border-2 border-zinc-700 bg-zinc-800 p-8"
>
	<h1 class="text-2xl font-bold">Reforge Items</h1>
	{#if selectedItem}
		<ItemRenderer item={selectedItem} mode={'ascii'} pclass={''} equippedSlot={undefined} />
	{:else}
		<button
			class="flex aspect-square h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 text-sm select-none"
			onclick={() => (selectMenuOpened = !selectMenuOpened)}
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

<ItemSelectMenu open={selectMenuOpened} allItems={ConglomerateItems(inventory, equipment)} />
