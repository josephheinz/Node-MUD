import type { ITooltipData } from '$lib/components/tooltip.old';
import { instantiateModifier } from '$lib/modifiers/modifiersRegistry';
import { Equipment, Rarity, type IItemModifier, type Item } from '$lib/types/item';
import type { RarityKey } from '$lib/types/item.old';
import { parse } from 'yaml';

export function parseYAMLToItem(yamlString: string): Item {
	let item = parse(yamlString)[0];
	const modifiers: IItemModifier[] = (item.modifiers || []).map(instantiateModifier);

	return {
		uid: crypto.randomUUID(),
		id: item.id,
		name: item.name,
		rarity: Rarity[item.rarity as RarityKey],
		icon: item.icon.image,
		modifiers,
		//baseStats: item.stats,
		desc: item.description
	};
}

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
