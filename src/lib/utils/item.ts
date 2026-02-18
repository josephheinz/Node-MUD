import { EnhancerModifier, StackableModifier, type EquippableModifier } from '$lib/modifiers/basicModifiers';
import { instantiateModifier, instantiateModifierFromHash } from '$lib/modifiers/modifiersRegistry';
import {
	Equipment,
	Inventory,
	Rarity,
	computeItemStats,
	initializeItemRegistry,
	itemRegistry,
	type DBItem,
	type EquipmentSlot,
	type IItemModifier,
	type IRawModifierSpec,
	type Item
} from '$lib/types/item';
import * as _ from 'radashi';
import { capitalizeFirstLetter, formatNumber } from './general';
import { isEqual } from 'radashi';
import { Stats } from '$lib/types/stats';
import type { ITooltipData } from '$lib/components/tooltip';
import type { ReforgeableModifier, ReforgeGroup, ReforgeModifier } from '$lib/modifiers/reforges';
import type { StarsModifier } from '$lib/modifiers/stars';
import { EnchantmentModifier, type Enchantment } from '$lib/modifiers/enchantments';

export async function Equip(
	item: Item,
	userId?: string
): Promise<{ inventory?: Inventory; equipment?: Equipment }> {
	if (!userId) throw new Error('No user logged in');

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

	let stats = computeItemStats(item);
	let statsString = '';

	const stackableModifier: StackableModifier | undefined = item.modifiers.find(
		(m) => m.type == 'Stackable'
	) as StackableModifier;
	let stackString = '';

	if (stackableModifier != undefined) {
		stackString = `Stack: ${formatNumber(stackableModifier.amount)} / ${formatNumber(stackableModifier.stack)}</br>`;
	}

	for (const key in stats) {
		const s = stats[key];
		if (s.base || s.added > 0) {
			//${Stats[key] ? `<span style="color:${Stats[key].color};">${Stats[key].icon} </span>` : ""}
			//style="color:oklch(90.5% 0.182 98.111);"
			statsString += `${capitalizeFirstLetter(key)}: ${s.base + s.added}<span class="text-muted-foreground">${s.added > 0 ? ` (+${s.added})` : ''}</span><br/>`;
		}
	}

	return {
		title: itemName,
		body: `${stackString}${equipMsg}${statsString}${itemDesc}<br/>${descriptor}`
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
	initializeItemRegistry();
	// check to see if its outdated
	canonicalizeDbItem(item);

	const base = structuredClone<Item>(itemRegistry[item.id]);
	base.modifiers = base.modifiers.map(instantiateModifier);
	/* 	const base = _.cloneDeep(itemRegistry[item.id]) as Item;
	 */
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
			slot = capitalizeFirstLetter((mod as EquippableModifier).slot) as EquipmentSlot;
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
	const stackableModifier: StackableModifier | undefined = item.modifiers.find(
		(m) => m.type === 'Stackable'
	) as StackableModifier;

	if (!stackableModifier) {
		contents.push(item);
		return new Inventory(contents);
	}

	if (!contents.some((i) => i.id === item.id)) {
		contents.push(item);
		return new Inventory(contents);
	}

	contents.forEach((i: Item) => {
		if (stackableModifier.amount === 0) return;
		if (item.id != i.id) return;

		const iStackable: StackableModifier | undefined = i.modifiers.find(
			(m) => m.type === 'Stackable'
		) as StackableModifier;
		if (!iStackable) return;

		const stackLeft: number = iStackable.stack - iStackable.amount;
		if (stackLeft === 0) {
			return;
		}

		iStackable.amount = Math.min(iStackable.stack, iStackable.amount + stackableModifier.amount);
		if (stackableModifier.amount <= stackLeft) {
			stackableModifier.amount = 0;
		} else {
			stackableModifier.amount -= stackLeft;
		}
	});

	if (stackableModifier.amount > 0) contents.push(item);

	return new Inventory(contents);
}


export function previewEnhanceItem(item: Item, enhancer: Item): Item {
	if (!item || !enhancer) throw new Error('Item or enhancer are undefined');

	const enhancements = enhancer.modifiers.find((m) => m.type === 'Enhancer') as
		| EnhancerModifier
		| undefined;
	if (!enhancements) throw new Error('Enhancer item does not actually have any enhancements');

	const instantiated = enhancements.enhancements.map(instantiateModifier);

	const newItem: Item = _.cloneDeep(item);

	for (const mod of instantiated) {
		if (mod.type === 'Stars') {
			const existing: StarsModifier | null = newItem.modifiers.find(
				(m): m is StarsModifier => m.type === 'Stars'
			) as StarsModifier;

			const addStars: number = (mod as StarsModifier).stars;

			if (existing) {
				existing.stars = Math.min(35, existing.stars + addStars);
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

		if (enhanceMod) {
			enhanceMod.enhancements = enhanceMod.enhancements.map((e) => instantiateModifier(e));
		}

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

			return item;
		}
	}

	let updatedEnchants: Enchantment[] = combineEnchantments(itemEnchants, enchants, reforgeGroup);

	let itemEnchantMod: EnchantmentModifier | undefined = item.modifiers.find(
		(m) => m.type === 'Enchantment'
	) as EnchantmentModifier;

	if (itemEnchantMod) itemEnchantMod.enchantments = updatedEnchants;

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