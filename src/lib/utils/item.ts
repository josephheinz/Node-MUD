import type { ITooltipData } from '$lib/components/tooltip.old';
import type { EquippableModifier, StackableModifier } from '$lib/modifiers/basicModifiers';
import { instantiateModifier, instantiateModifierFromHash } from '$lib/modifiers/modifiersRegistry';
import {
	Equipment,
	Rarity,
	itemRegistry,
	type DBItem,
	type EquipmentSlot,
	type IItemModifier,
	type IRawModifierSpec,
	type Item
} from '$lib/types/item';
import * as _ from 'radashi';
import { formatNumber } from './general';

export function Equip(equipment: Equipment, item: Item): Equipment {
	return equipment;
}

export function Unequip(equipment: Equipment, item: Item): Equipment {
	return equipment;
}

export function getItemData(item: Item, equippable: boolean = false): ITooltipData {
	let rarityName: string = getRarity(item.rarity);
	let descriptor: string = `<b style="color:${item.rarity}">${rarityName} Item</b>`;

	let itemName: string = getDisplayName(item);
	let itemDesc: string = getDisplayDescription(item);

	let slot: EquipmentSlot | undefined = determineSlot(item);
	let equipMsg: string = '';
	if (slot && equippable) equipMsg = `Slot: ${slot}<br/>`;

	const stackableModifier: StackableModifier | undefined = item.modifiers.find(
		(m) => m.type == 'Stackable'
	) as StackableModifier;
	let stackString = '';

	if (stackableModifier != undefined) {
		stackString = `Stack: ${formatNumber(stackableModifier.amount)} / ${formatNumber(stackableModifier.stack)}</br>`;
	}

	return {
		title: itemName,
		body: `${stackString}${equipMsg}${itemDesc}<br/>${descriptor}`
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

export function encodeDBItem(item: Item): DBItem {
	if (!itemRegistry[item.id]) throw new Error(`Unknown item id: ${item.id}`);

	const encodedMods: string[] = item.modifiers.map((mod) => mod.hash());

	encodedMods.sort();

	return {
		id: item.id,
		modifiers: encodedMods
	};
}

export function loadDbItem(item: DBItem): Item {
	// check to see if its outdated
	canonicalizeDbItem(item);

	const base = _.cloneDeep(itemRegistry[item.id]) as Item;
	if (!base) throw new Error(`Unknown item id: ${item.id}`);

	const dbMods: IItemModifier[] = item.modifiers?.map(instantiateModifierFromHash) ?? [];

	let merged: IItemModifier[] = [...base.modifiers];

	for (const mod of dbMods) {
		const i = merged.findIndex((m) => m.type === mod.type);
		if (i >= 0) merged[i] = mod;
		else merged.push(mod);
	}

	return {
		...base,
		uid: crypto.randomUUID(),
		modifiers: merged
	};
}

export function canonicalizeDbItem(db: DBItem): DBItem {
	return {
		id: db.id,
		modifiers: (db.modifiers ?? []).map((m: string | IRawModifierSpec) =>
			// if mod is already a string, keep it
			// otherwise, if it can be hashed, hash it
			// otherwise otherwise, try to instantiate then hash it
			typeof m === 'string' ? m : m?.hash ? m.hash() : instantiateModifier(m).hash()
		)
	};
}

export function getDisplayName(item: Item): string {
	let name = item.name;
	for (const mod of sortModifiersByPriority(item.modifiers, 'asc') ?? []) {
		if (mod.modifyName) name = mod.modifyName(name);
	}
	return name;
}

export function getDisplayDescription(item: Item): string {
	const base = item.desc ? `<i>${item.desc}</i>` : '';
	return (
		sortModifiersByPriority(item.modifiers, 'desc')?.reduce(
			(desc, mod) => (mod.modifyDescription ? mod.modifyDescription(desc) : desc),
			base
		) ?? base
	);
}

export function determineSlot(
	item: Item,
	equipment: Equipment = new Equipment({})
): EquipmentSlot | undefined {
	let slot: EquipmentSlot | undefined = undefined;

	item.modifiers.forEach((mod: IItemModifier) => {
		if (mod.type !== 'Equippable' || !(mod as EquippableModifier).slot) return;
		try {
			slot = (mod as EquippableModifier).slot as EquipmentSlot;
			return;
		} catch (err) {
			throw new Error(`${err}`);
		}
	});

	return slot;
}
