import type { ITooltipData } from '$lib/components/tooltip.old';
import { Equipment, Rarity, type IItemModifier, type Item } from '$lib/types/item';

export function Equip(equipment: Equipment, item: Item): Equipment {
	return equipment;
}

export function Unequip(equipment: Equipment, item: Item): Equipment {
	return equipment;
}

export function getItemData(item: Item): ITooltipData {
	let rarityName: string = getRarity(item.rarity);
	let descriptor: string = `<b style="color:${item.rarity}">${rarityName} Item</b>`;

	let itemName: string = item.name;
	let itemDesc: string = item.desc ?? '';

	return {
		title: itemName,
		body: `${itemDesc}<br/>${descriptor}`
	};
}

export function getRarity(color: string): string {
	const rarity =
		Object.keys(Rarity).find((k) => Rarity[k as keyof typeof Rarity] === color) ?? Rarity.Common;
	return rarity;
}

export function sortModifiersByPriority(
	mods: IItemModifier[],
	mode: 'asc' | 'desc'
): IItemModifier[] {
	const dir = mode === 'asc' ? 1 : -1;

	return mods.sort((a, b) => ((a.priority ?? 0) - (b.priority ?? 0)) * dir);
}

