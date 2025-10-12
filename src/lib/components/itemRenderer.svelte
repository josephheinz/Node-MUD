<script lang="ts">
	import { type Item, getItemData } from '$lib/types/item';
	import { tooltip } from './tooltip';
	import { Equip, Unequip, type EquipmentSlot } from '$lib/types/equipment';
	import { contextMenu, type ContextMenuItem } from './contextmenu';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import { linkToChat } from '$lib/utils/chat';
	import { determineSlot } from '$lib/utils/item';

	interface Props {
		item: Item;
		pclass?: string;
		equippedSlot?: EquipmentSlot;
		equippable?: boolean;
	}

	const { item, pclass = '', equippedSlot = undefined, equippable = true }: Props = $props();

	function handleClick() {
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
