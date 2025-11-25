import { EmptyEquipment, type Equipment, type EquipmentSlot } from '$lib/types/equipment';
import { itemRegistry, type DBItem, type IItemModifier, type Item } from '$lib/types/item';
import { deepClone } from './general';
import { get } from 'svelte/store';
import * as store from '$lib/store';
import { instantiateModifier } from '$lib/modifiers/modifiersRegistry';
import type { StackableModifier } from '$lib/modifiers/basicModifiers';
import ItemHover from '$lib/components/chat/itemHover.svelte';

export function ConglomerateItems(inventory: Item[], equipment: Equipment): Item[] {
	let inventoryCopy: Item[] = deepClone<Item[]>(inventory) ?? [];
	let result: Item[] = [];

	inventoryCopy.forEach((item: Item) => {
		item.modifiers = reviveModifiers(item.modifiers);
		result.push(item as Item);
	});

	Object.values(deepClone<Equipment>(equipment) ?? EmptyEquipment).forEach((item: Item | null) => {
		if (item) {
			// re-instantiate all modifiers so methods exist
			item.modifiers = reviveModifiers(item.modifiers);
			result.push(item as Item);
		}
	});

	return result;
}

export function determineSlot(
	item: Item,
	equipment: Equipment = get(store.equipment)
): EquipmentSlot | undefined {
	let slot: EquipmentSlot | undefined = undefined;

	item.modifiers.forEach((mod: IItemModifier) => {
		if (mod.type !== 'Equippable' || !mod.value || typeof mod.value !== 'string') return;
		//if (equipment[mod.value as keyof Equipment] != undefined) return;
		try {
			slot = mod.value as EquipmentSlot;
			return;
		} catch (err) {
			throw new Error(`${err}`);
		}
	});

	return slot;
}

export async function getItem(id: string): Promise<Item> {
	let item: Item | undefined;
	const res = await fetch(`/api/item/${id}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			item = data.item;
		})
		.catch((error) => {
			console.error(error);
		});
	if (item) return item;

	throw new Error(`Item not found: ${id}`);
}

export function loadDbItem(dbItem: DBItem): Item {
	const base = deepClone(itemRegistry[dbItem.id]);
	if (!base) throw new Error(`Unknown item id: ${dbItem.id}`);

	const dbMods = dbItem.modifiers ?? [];

	// Keep base modifiers AND db modifiers.
	let merged = [...base.modifiers];

	for (const mod of dbMods) {
		const existingIndex = merged.findIndex((m) => m.type === mod.type);
		if (existingIndex >= 0) {
			merged[existingIndex] = mod;
		} else {
			merged.push(mod);
		}
	}

	merged = reviveModifiers(merged);

	return {
		...base,
		uid: crypto.randomUUID(),
		modifiers: merged as IItemModifier[]
	};
}

export function encodeDbItem(item: Item): DBItem {
	const base = itemRegistry[item.id];
	const encodedMods: IItemModifier[] = [];

	for (const mod of item.modifiers ?? []) {
		const baseMod = base.modifiers.find((b) => b.type === mod.type);

		if (!baseMod) {
			encodedMods.push(mod);
			continue;
		}

		let changed = false;
		const diff: any = { type: mod.type };

		for (const key of Object.keys(mod) as (keyof IItemModifier)[]) {
			if (mod[key] !== baseMod[key]) {
				diff[key] = mod[key];
				changed = true;
			}
		}

		if (changed) encodedMods.push(mod);
	}

	return { id: item.id, modifiers: encodedMods };
}

export function hydrateInventory(inventory: DBItem[]): Item[] {
	let hydratedInventory: Item[] = [];

	inventory.forEach((item: DBItem) => {
		let loadedItem = loadDbItem(item);
		hydratedInventory.push(loadedItem);
	});

	return hydratedInventory;
}

export function reviveModifiers(mods: IItemModifier[]): IItemModifier[] {
	return mods.map((mod) => instantiateModifier(mod));
}

export function tryStackItemInInventory(item: Item, inventory: Item[]): Item[] {
	const stackableModifier: StackableModifier | undefined = item.modifiers.find(
		(m) => m.type == 'Stackable'
	) as StackableModifier;

	if (!stackableModifier) {
		inventory.push(item);
		return inventory;
	}

	const inventoryStacks: Item[] = inventory.filter((i) => i.id === item.id);

	if (inventoryStacks.length === 0) {
		inventory.push(item);
		return inventory;
	}

	let updatedStackIndex: number = inventory.findIndex(
		(i) =>
			i.id === item.id &&
			(i.modifiers.find((m) => m.type === 'Stackable') as StackableModifier)?.value +
				stackableModifier.value <
				stackableModifier.stack
	);

	if (updatedStackIndex === -1) {
		inventory.push(item);
		return inventory;
	} else {
		const stackModifierIndex: number = inventory[updatedStackIndex].modifiers.findIndex(
			(m) => m.type === 'Stackable'
		);
		(inventory[updatedStackIndex].modifiers[stackModifierIndex] as StackableModifier).value +=
			stackableModifier.value;
		return inventory;
	}
}
