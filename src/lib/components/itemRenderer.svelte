<script lang="ts">
	import { type Item, determineSlot, getItemData } from '$lib/items';
	import { tooltip } from './tooltip';
	import { Equip, Unequip, type EquipmentSlot } from '$lib/types';
	import { contextMenu, type ContextMenuItem } from './contextmenu';
	import { type EventDispatcher } from 'svelte';
	import { linkToChat } from '$lib/utils';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';

	interface Props {
		item: Item;
		pclass?: string;
		equippedSlot?: EquipmentSlot;
		equippable?: boolean;
	}

	const { item, pclass = '', equippedSlot = undefined, equippable = true }: Props = $props();

	function handleClick() {
		console.log(item);
		if (equippedSlot && equippable) {
			Unequip(equippedSlot);
		} else {
			const slot = determineSlot(item);
			if (slot) {
				Equip(item);
			} else {
				console.warn('Item is not equippable:', item);
			}
		}
	}
	let message = $state('Right click on the box!');

	const menuItems: ContextMenuItem[] = [
		{
			name: 'link',
			displayText: 'Link In Chat',
			icon: 'fa-solid fa-plus',
			onClick: () => {
				const chatLink = linkToChat(get(store.chatItemLinkTable), get(store.chatMessage), item);
				store.chatItemLinkTable.set(chatLink.itemLinkTable);
				store.chatMessage.set(chatLink.message);
				console.log(get(store.chatItemLinkTable), get(store.chatMessage));
			}
		},
		{
			name: 'zoom',
			displayText: 'Zoom',
			icon: 'fa-solid fa-magnifying-glass',
			onClick: () => {
				message = 'Zooom...';
			}
		},
		{
			name: 'print',
			displayText: 'Print',
			icon: 'fa-solid fa-print',
			onClick: () => {
				message = 'Printed...';
			}
		},
		{ name: 'hr', isDivider: true },
		{
			name: 'settings',
			displayText: 'Settings',
			icon: 'fa-solid fa-gear',
			onClick: () => {
				message = 'Settings...';
			}
		},
		{ name: 'hr', isDivider: true },
		{
			name: 'trash',
			displayText: 'Trash',
			icon: 'fa-solid fa-trash-can',
			onClick: () => {
				message = 'Removed...';
			}
		}
	];
</script>

<div
	class="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-600 p-2 {pclass}"
	style="border:2px solid {item?.rarity};"
	title=""
	use:tooltip={getItemData(item as Item, equippable)}
	use:contextMenu={{ menuItems }}
	ondblclick={handleClick}
	role="button"
	tabindex="0"
>
	{#if item.icon.image}
		<div
			class="h-full w-full bg-current"
			style="
		-webkit-mask: url({item.icon.image}) no-repeat center;
		mask: url({item.icon.image}) no-repeat center;
		-webkit-mask-size: contain;
		mask-size: contain;
		background: {item.rarity};
	"
		></div>
	{:else}
		<span class="ascii-item text-4xl select-none" style="color:{item?.rarity};"
			>{item?.icon?.ascii}</span
		>
	{/if}
</div>
