import type { ITooltipData } from '$lib/components/tooltip.old';
import { StackableModifier, type EquippableModifier } from '$lib/modifiers/basicModifiers';
import { instantiateModifier, instantiateModifierFromHash } from '$lib/modifiers/modifiersRegistry';
import {
	Equipment,
	Inventory,
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
import { isEqual } from 'radashi';

export async function Equip(
	item: Item,
	userId?: string
): Promise<{ inventory?: Inventory; equipment?: Equipment }> {
	if (!userId) console.error('No user logged in');

	const res = await fetch(`/api/equipment/${userId}/equip`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ dbItem: encodeDBItem(item) })
	});

	const data = await res.json();

	if (!res.ok) {
		console.error('Failed to equip:', data.error);
		throw new Error(data.error);
	}

	let newEq = Equipment.load(data.equipment_data);
	let newInv = Inventory.load(data.inventory_data);

	return {
		inventory: newInv,
		equipment: newEq
	};
}

export async function Unequip(
	equipment: Equipment,
	item: Item,
	userId?: string
): Promise<{ inventory?: Inventory; equipment?: Equipment }> {
	if (!userId) console.error('No user logged in');

	const slot: EquipmentSlot | undefined = determineSlot(item);
	if (!slot) throw new Error('Item is not equippable');

	if (equipment[slot] === null) throw new Error('Item is not currently equipped');

	const res = await fetch(`/api/equipment/${userId}/unequip`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ slot })
	});

	const data = await res.json();

	if (!res.ok) {
		console.error('Failed to equip:', data.error);
		throw new Error(data.error);
	}

	let newEq = Equipment.load(data.equipment_data);
	let newInv = Inventory.load(data.inventory_data);

	return {
		inventory: newInv,
		equipment: newEq
	};
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
	const baseItem = itemRegistry[item.id];
	if (!baseItem) throw new Error(`Unknown item id: ${item.id}`);

	const baseModHashes: string[] = baseItem.modifiers.map((mod) => mod.hash());
	const encodedMods: string[] = item.modifiers.map((mod) => mod.hash());

	const diffModifiers: string[] = _.diff(encodedMods, baseModHashes);

	return {
		id: item.id,
		modifiers: diffModifiers
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

export function compareItems(a: Item, b: Item): boolean {
	const sa: Item = {
		...a,
		modifiers: [...(a.modifiers ?? [])].sort()
	};

	const sb: Item = {
		...b,
		modifiers: [...(b.modifiers ?? [])].sort()
	};

	return isEqual(sa, sb);
}

export function compareDbItems(a: DBItem, b: DBItem): boolean {
	const sa: DBItem = {
		...a,
		modifiers: [...(a.modifiers ?? [])].sort()
	};

	const sb: DBItem = {
		...b,
		modifiers: [...(b.modifiers ?? [])].sort()
	};

	return isEqual(sa, sb);
}

export function getItem(id: string): Item | null {
	if (itemRegistry[id]) return itemRegistry[id];
	return null;
}

export function tryStackItemInInventory(item: Item, inventory: Item[] | Inventory): Inventory {
	const contents: Item[] = inventory instanceof Inventory ? inventory.contents : inventory;
	const stackableModifier: StackableModifier | undefined = item.modifiers.find(m => m.type === "Stackable") as StackableModifier;

	if (!stackableModifier) {
		contents.push(item);
		return new Inventory(contents);
	}

	if (!contents.some(i => i.id === item.id)) {
		contents.push(item);
		return new Inventory(contents);
	}

	contents.forEach((i: Item) => {
		if (stackableModifier.amount === 0) return;
		if (item.id != i.id) return;

		const iStackable: StackableModifier | undefined = i.modifiers.find(m => m.type === "Stackable") as StackableModifier;
		if (!iStackable) return;

		const stackLeft: number = iStackable.stack - iStackable.amount;
		if (stackLeft === 0) return;

		iStackable.amount = iStackable.stack;
		if (stackableModifier.amount <= stackLeft) {
			stackableModifier.amount = 0;
		} else {
			stackableModifier.amount -= stackLeft;
		}
	});

	return new Inventory(contents);
}