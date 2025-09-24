<script lang="ts">
	import { type Item, determineSlot, getItemData } from '$lib/items';
	import { tooltip } from './tooltip';
	import { Equip, Unequip, type EquipmentSlot } from '$lib/types';

	interface Props {
		item: Item;
		mode?: 'ascii' | 'sprite';
		pclass?: string;
		equippedSlot?: EquipmentSlot;
	}

	const { item, mode = 'ascii', pclass = '', equippedSlot = undefined }: Props = $props();

	function handleClick() {
		if (equippedSlot) {
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
</script>

<div
	class="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-600 p-2 {pclass}"
	style="border:2px solid {item?.rarity};"
	title=""
	use:tooltip={getItemData(item)}
	ondblclick={handleClick}
	role="button"
	tabindex="0"
>
	{#if mode == 'ascii'}
		<span class="ascii-item text-4xl select-none" style="color:{item?.rarity};"
			>{item?.icon?.ascii}</span
		>
	{:else if mode == 'sprite'}
		<img src={item?.icon?.image} alt="Item sprite" />
	{/if}
</div>
