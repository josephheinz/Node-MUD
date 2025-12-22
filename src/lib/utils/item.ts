import { EmptyEquipment, type Equipment, type EquipmentSlot } from '$lib/types/equipment';
import { itemRegistry, type DBItem, type IItemModifier, type Item } from '$lib/types/item';
import { deepClone } from './general';
import { get } from 'svelte/store';
import * as store from '$lib/store';
import { instantiateModifier } from '$lib/modifiers/modifiersRegistry';
import type { EnhancerModifier, StackableModifier } from '$lib/modifiers/basicModifiers';
import type { StarsModifier } from '$lib/modifiers/stars';
import type { ReforgeableModifier, ReforgeGroup, ReforgeModifier } from '$lib/modifiers/reforges';
import { EnchantmentModifier, type Enchantment } from '$lib/modifiers/enchantments';

/**
 * Combine inventory and equipped items into a single list with modifiers reinstantiated.
 *
 * Returns a new array containing all items from `inventory` and all non-null items from `equipment`.
 * Each item in the result has its modifiers revived (instantiated) so modifier methods are available.
 *
 * @param inventory - Array of inventory items to include
 * @param equipment - Equipment object whose non-null slots will be included
 * @returns An array of items from inventory and equipment with revived modifiers
 */
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

/**
 * Determine which equipment slot the item is marked as equippable for.
 *
 * @param item - The item to inspect for an `Equippable` modifier
 * @param equipment - Optional equipment map used for context (defaults to the current store equipment)
 * @returns The `EquipmentSlot` the item is equippable to, or `undefined` if no equippable slot is specified
 * @throws Error if an `Equippable` modifier contains an invalid slot value
 */
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

/**
 * Fetches an item by its identifier from the backend API.
 *
 * @param id - The identifier of the item to retrieve
 * @returns The fetched `Item`
 * @throws Error if the item cannot be retrieved or does not exist
 */
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

/**
 * Create a runtime Item from a stored DBItem by merging its modifier overrides with the base item and reviving modifier instances.
 *
 * @param dbItem - Database representation containing the base item `id` and optional `modifiers` to add or replace
 * @returns A new Item cloned from the registry entry with a freshly generated `uid` and revived, merged modifiers
 * @throws Error if `dbItem.id` does not exist in the item registry
 */
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

/**
 * Produce a compact DB representation of an Item by including only modifiers that differ from the registry base or are new.
 *
 * @param item - The in-memory Item to encode
 * @returns A DBItem containing the item's `id` and an array of modifiers that are either not present on the base item or have fields that differ from the base
 */
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

/**
 * Convert an array of database item records into fully hydrated Item instances.
 *
 * @param inventory - Array of `DBItem` records to hydrate into runtime `Item` objects
 * @returns An array of `Item` objects with modifiers revived and other runtime fields populated
 */
export function hydrateInventory(inventory: DBItem[]): Item[] {
	let hydratedInventory: Item[] = [];

	inventory.forEach((item: DBItem) => {
		let loadedItem = loadDbItem(item);
		hydratedInventory.push(loadedItem);
	});

	return hydratedInventory;
}

/**
 * Reinstantiates raw modifier objects into their concrete modifier instances.
 *
 * @param mods - Array of modifier data (possibly plain objects) to revive into instantiated modifiers
 * @returns An array of instantiated `IItemModifier` objects with runtime behavior restored
 */
export function reviveModifiers(mods: IItemModifier[]): IItemModifier[] {
	return mods.map((mod) => instantiateModifier(mod));
}

/**
 * Adds an item to the inventory, merging its Stackable value into an existing stack of the same item when capacity allows.
 *
 * @param item - The item to add or merge into the inventory
 * @param inventory - The inventory array to update; this array is mutated and also returned
 * @returns The updated inventory array with the item merged into an existing stack if possible, otherwise appended as a new entry
 */
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

export function previewEnhanceItem(item: Item, enhancer: Item): Item {
	if (!item || !enhancer) throw new Error('Item or enhancer are undefined');

	const enhancements = enhancer.modifiers.find((m) => m.type === 'Enhancer') as
		| EnhancerModifier
		| undefined;
	if (!enhancements) throw new Error('Enhancer item does not actually have any enhancements');

	const instantiated = enhancements.enhancements.map(instantiateModifier);

	const newItem: Item = deepClone(item);
	newItem.modifiers = reviveModifiers(newItem.modifiers);

	for (const mod of instantiated) {
		if (mod.type === 'Stars') {
			const existing: StarsModifier | null = newItem.modifiers.find(
				(m): m is StarsModifier => m.type === 'Stars'
			) as StarsModifier;

			if (existing) {
				existing.stars += (mod as StarsModifier).stars;
				continue;
			}
		} else if (mod.type === 'Reforge') {
			const existing: number = newItem.modifiers.findIndex(
				(m): m is ReforgeModifier => m.type === 'Reforge'
			);

			newItem.modifiers.splice(existing, 1);
		} else if (mod.type === 'Enchantment') {
			addEnchantments(newItem, (mod as EnchantmentModifier).enchantments);
			continue;
		}

		newItem.modifiers.push(mod);
	}

	return newItem;
}

// dont ask me, im confused writing this
export function addEnchantments(item: Item, enchants: Enchantment[]): Item {
	const reforgeGroup: ReforgeGroup | undefined = (
		item.modifiers.find((m) => m.type === 'Reforgeable') as ReforgeableModifier
	).group as ReforgeGroup;

	const enchantMod: EnchantmentModifier | undefined = item.modifiers.find(
		(m) => m.type === 'Enchantment'
	) as EnchantmentModifier;

	const itemEnchants: Enchantment[] = enchantMod?.enchantments ?? [];

	if (!reforgeGroup) return item;

	if (!enchantMod) {
		const enhanceMod: EnhancerModifier | undefined = item.modifiers.find(
			(m) => m.type === 'Enhancer'
		) as EnhancerModifier;

		const enchantEnhancement: EnchantmentModifier | undefined = enhanceMod?.enhancements.find(
			(e) => e.type === 'Enchantment'
		) as EnchantmentModifier;

		console.log(item.modifiers);

		if (enhanceMod && enchantEnhancement) {
			let updatedEnchants: Enchantment[] = combineEnchantments(
				enchantEnhancement.enchantments,
				enchants,
				reforgeGroup
			);

			enchantEnhancement.enchantments = updatedEnchants;

			return item;
		} else {
			let newEnchantMod: EnchantmentModifier = new EnchantmentModifier([]);

			enchants.forEach((e) => {
				if (e.applies.includes(reforgeGroup) || reforgeGroup === 'Enchanted Book') {
					newEnchantMod.enchantments.push(e);
				}
			});

			item.modifiers.push(newEnchantMod);
			console.log(item);

			return item;
		}
	}

	let updatedEnchants: Enchantment[] = combineEnchantments(itemEnchants, enchants, reforgeGroup);

	let itemEnchantMod: EnchantmentModifier | undefined = item.modifiers.find(
		(m) => m.type === 'Enchantment'
	) as EnchantmentModifier;

	if (itemEnchantMod) itemEnchantMod.enchantments = updatedEnchants;

	console.log(item);

	return item;
}

export function combineEnchantments(
	enchants: Enchantment[],
	add: Enchantment[],
	reforgeGroup: ReforgeGroup
): Enchantment[] {
	let updatedEnchants: Enchantment[] = [];

	add.forEach((enchant) => {
		const name: string = enchant.name;
		const applies: ReforgeGroup[] = enchant.applies;

		let existing: Enchantment | undefined = enchants.find((e) => e.name === name);

		if (!existing) {
			if (applies.includes(reforgeGroup) || reforgeGroup === 'Enchanted Book')
				updatedEnchants.push(enchant);
		} else {
			let existingLevel: number = existing.level;
			let exisitingMax: number = existing.maxLevel;

			if (existingLevel >= exisitingMax) return;

			if (enchant.level < existingLevel) {
				return;
			} else if (enchant.level === existingLevel) {
				existing.level++;
			} else if (enchant.level > existingLevel) {
				existing.level = enchant.level;
			}

			updatedEnchants.push(existing);
			return;
		}
	});

	return updatedEnchants;
}
