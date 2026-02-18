import * as _ from 'radashi';
import type { Stat, StatList } from './stats';
import { encodeDBItem, loadDbItem } from '$lib/utils/item';
import { initializeModifierRegistry, instantiateModifier } from '$lib/modifiers/modifiersRegistry';
import { parse } from 'yaml';
import { capitalizeFirstLetter } from '$lib/utils/general';
import type { StackableModifier } from '$lib/modifiers/basicModifiers';

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
	Common = '#bdbdbd',
	Uncommon = '#32a852',
	Rare = '#5b8dfa',
	Epic = '#d335f3',
	Legendary = '#EFBF04',
	Mythic = '#fd89e8',
	Divine = '#3fe9ff',
	Special = '#ff5252'
}

export interface IItemModifier {
	type: string;
	displayName?: string;
	priority: number;
	statChanges?: StatList;

	modifyName?(baseName: string): string;
	modifyDescription?(baseDesc: string): string;

	toJSON(): IRawModifierSpec;
	hash(): string;
}

export interface IRawModifierSpec {
	type: string;
	[key: string]: any;
}

export interface IItemModifierClass<T extends IItemModifier = IItemModifier> {
	// For building from objects
	//toJSON(): object;
	fromJSON(raw: IRawModifierSpec): T;
	// For building from hashes
	//hash(): string;
	fromHash(hash: string): T;

	new(...args: any[]): T;
}

export type Item = {
	uid: string;
	id: string;
	name: string;
	rarity: Rarity;
	desc?: string;
	icon: string;
	baseStats?: StatList;
	modifiers: IItemModifier[];
	position?: string;
};

export type DBItem = {
	id: string;
	modifiers?: string[];
};

export type DBInventory = DBItem[];

export type SortType =
	| 'Chronological'
	| 'Rarity'
	| 'Stack Size'
	| 'Alphabetical';

export type SortDirection = 'asc' | 'desc';

const rarityOrder: Record<Rarity, number> = {
	[Rarity.Common]: 0,
	[Rarity.Uncommon]: 1,
	[Rarity.Rare]: 2,
	[Rarity.Epic]: 3,
	[Rarity.Legendary]: 4,
	[Rarity.Mythic]: 5,
	[Rarity.Divine]: 6,
	[Rarity.Special]: 7
};

const dir = (direction: SortDirection) => (direction === 'asc' ? 1 : -1);

export const sortChronological = (
	items: Item[],
	direction: SortDirection
) => {
	return direction === 'asc'
		? [...items]
		: [...items].reverse();
};

export const sortByRarity = (
	items: Item[],
	direction: SortDirection
) => {
	return [...items].sort(
		(a, b) =>
			(rarityOrder[a.rarity] - rarityOrder[b.rarity]) * dir(direction)
	);
};

const getStackSize = (item: Item): number => {
	const stack = item.modifiers.find(
		(m): m is StackableModifier => m.type === 'Stackable'
	);
	return stack?.amount ?? 1;
};

export const sortByStackSize = (
	items: Item[],
	direction: SortDirection
) => {
	return [...items].sort(
		(a, b) =>
			(getStackSize(a) - getStackSize(b)) * dir(direction)
	);
};

export const sortAlphabetical = (
	items: Item[],
	direction: SortDirection
) => {
	return [...items].sort(
		(a, b) =>
			a.name.localeCompare(b.name) * dir(direction)
	);
};

export class Inventory {
	private _contents: Array<Item>;

	constructor(initalContents: Item[]) {
		this._contents = initalContents;
	}

	public get contents(): Item[] {
		return this._contents;
	}

	public add(item: Item, index?: number): Item[] {
		if (index !== undefined && (index < 0 || index > this._contents.length))
			throw new Error(`Index ${index} is out of bounds`);

		if (index === undefined) {
			this._contents.push(item);
		} else {
			this._contents.splice(index, 0, item);
		}

		return this._contents;
	}


	public getItem(index: number): Item {
		return this._contents[index];
	}

	public paginate(): Array<Item[]> {
		return _.cluster(this._contents, 25);
	}

	public serialize(): DBInventory {
		return this._contents.map(encodeDBItem);
	}

	public sort(type: SortType, mode: SortDirection): Inventory {
		switch (type) {
			case 'Chronological':
				return new Inventory(sortChronological(this._contents, mode));
			case 'Rarity':
				return new Inventory(sortByRarity(this._contents, mode));
			case 'Stack Size':
				return new Inventory(sortByStackSize(this._contents, mode));
			case 'Alphabetical':
				return new Inventory(sortAlphabetical(this._contents, mode));
			default:
				return new Inventory(this._contents);
		}
	}

	public static load(dbInv: DBInventory): Inventory {
		return new Inventory(dbInv.map(loadDbItem));
	}

}

export type EquipmentSlot =
	| 'Head'
	| 'Body'
	| 'Legs'
	| 'Offhand'
	| 'Mainhand'
	| 'Necklace'
	| 'Ring'
	| 'Hands';

export class Equipment {
	private _head: Item | null = null;
	private _body: Item | null = null;
	private _legs: Item | null = null;
	private _offhand: Item | null = null;
	private _mainhand: Item | null = null;
	private _necklace: Item | null = null;
	private _ring: Item | null = null;
	private _hands: Item | null = null;

	constructor(initValues: {
		Head?: Item;
		Body?: Item;
		Legs?: Item;
		Offhand?: Item;
		Mainhand?: Item;
		Necklace?: Item;
		Ring?: Item;
		Hands?: Item;
	}) {
		// Holy vomit
		// maybe ill figure out a better way to do this in the future
		this._head = initValues.Head ? initValues.Head : null;
		this._body = initValues.Body ? initValues.Body : null;
		this._legs = initValues.Legs ? initValues.Legs : null;
		this._offhand = initValues.Offhand ? initValues.Offhand : null;
		this._mainhand = initValues.Mainhand ? initValues.Mainhand : null;
		this._necklace = initValues.Necklace ? initValues.Necklace : null;
		this._ring = initValues.Ring ? initValues.Ring : null;
		this._hands = initValues.Hands ? initValues.Hands : null;
	}

	get Head() {
		return this._head;
	}
	private set Head(v: Item | null) {
		this._head = v;
	}

	get Body() {
		return this._body;
	}
	private set Body(v: Item | null) {
		this._body = v;
	}

	get Legs() {
		return this._legs;
	}
	private set Legs(v: Item | null) {
		this._legs = v;
	}

	get Offhand() {
		return this._offhand;
	}
	private set Offhand(v: Item | null) {
		this._offhand = v;
	}

	get Mainhand() {
		return this._mainhand;
	}
	private set Mainhand(v: Item | null) {
		this._mainhand = v;
	}

	get Necklace() {
		return this._necklace;
	}
	private set Necklace(v: Item | null) {
		this._necklace = v;
	}

	get Ring() {
		return this._ring;
	}
	private set Ring(v: Item | null) {
		this._ring = v;
	}

	get Hands() {
		return this._hands;
	}
	private set Hands(v: Item | null) {
		this._hands = v;
	}

	public Equip(item: Item, slot: EquipmentSlot): Item | null {
		const prev = this[slot];
		this[slot] = item;
		return prev;
	}

	public Unequip(slot: EquipmentSlot): Item | null {
		const prev = this[slot];
		if (prev) {
			this[slot] = null;
			return prev;
		} else return null;
	}

	public serialize(): DBEquipment {
		return {
			Head: this._head ? encodeDBItem(this._head) : null,
			Body: this._body ? encodeDBItem(this._body) : null,
			Legs: this._legs ? encodeDBItem(this._legs) : null,
			Offhand: this._offhand ? encodeDBItem(this._offhand) : null,
			Mainhand: this._mainhand ? encodeDBItem(this._mainhand) : null,
			Necklace: this._necklace ? encodeDBItem(this._necklace) : null,
			Ring: this._ring ? encodeDBItem(this._ring) : null,
			Hands: this._hands ? encodeDBItem(this._hands) : null
		};
	}

	public static load(dbEquip: DBEquipment): Equipment {
		let equipment: Record<string, Item | null> = {};
		Object.entries(dbEquip).forEach(([slot, item]) => {
			if (item === null) {
				equipment[slot] = null;
				return;
			}

			equipment[capitalizeFirstLetter(slot)] = loadDbItem(item);
		});

		return new Equipment({
			...equipment
		});
	}

	public export(): Array<[EquipmentSlot, Item | null]> {
		return [
			['Head', this._head],
			['Body', this._body],
			['Legs', this._legs],
			['Offhand', this._offhand],
			['Mainhand', this._mainhand],
			['Necklace', this._necklace],
			['Ring', this._ring],
			['Hands', this._hands]
		];
	}

	public toArray(): Array<Item> {
		return this.export().map(inner => inner[1])
			.filter(value => value != null);
	}
}

export type DBEquipment = {
	Head: DBItem | null;
	Body: DBItem | null;
	Legs: DBItem | null;
	Offhand: DBItem | null;
	Mainhand: DBItem | null;
	Necklace: DBItem | null;
	Ring: DBItem | null;
	Hands: DBItem | null;
};

export const EmptyEquipment: DBEquipment = {
	Head: null,
	Body: null,
	Legs: null,
	Offhand: null,
	Mainhand: null,
	Necklace: null,
	Ring: null,
	Hands: null
};

// i know functions should be in here but it makes things cyclical if its in utils/item
export function parseYAMLToItem(yamlString: string): Item {
	let item = parse(yamlString)[0];
	const modifiers: IItemModifier[] = (item.modifiers || []).map(instantiateModifier);

	let baseStats: StatList = {};
	if (item.stats) {
		Object.entries(item.stats).forEach(([stat, amount]) => {
			baseStats[stat] = { amount: Number(amount), operation: "additive" }
		})
	}

	return {
		uid: crypto.randomUUID(),
		id: item.id,
		name: item.name,
		rarity: Rarity[item.rarity as RarityKey],
		icon: item.icon.image,
		modifiers,
		baseStats,
		desc: item.description,
		position: item.position
	};
}

export function computeItemStats(item: Item): Record<string, { base: number; added: number }> {
	const stats: Record<string, { base: number; added: number }> = {};
	const baseStats = item.baseStats ?? {};
	const modifiers = item.modifiers ?? [];

	// Single pass: collect additive and multiplicative modifiers per stat
	const statData: Record<string, {
		base: number;
		modAdditive: number;
		modMultiplicative: number;
		reforgeAdditive: number;
		reforgeMultiplicative: number;
	}> = {};

	// Initialize with base stats
	for (const key in baseStats) {
		statData[key] = {
			base: baseStats[key]?.amount ?? 0,
			modAdditive: 0,
			modMultiplicative: 1,
			reforgeAdditive: 0,
			reforgeMultiplicative: 1
		};
	}

	// Single pass through modifiers
	for (const mod of modifiers) {
		if (!mod.statChanges) continue;

		for (const key in mod.statChanges) {
			const value = mod.statChanges[key];
			if (!value || value.amount === 0) continue;

			// Initialize stat if not seen before
			if (!statData[key]) {
				statData[key] = {
					base: baseStats[key]?.amount ?? 0,
					modAdditive: 0,
					modMultiplicative: 1,
					reforgeAdditive: 0,
					reforgeMultiplicative: 1
				};
			}

			const isReforge = mod.type === "Reforge";
			const isMultiplicative = value.operation === "multiplicative";

			if (isReforge) {
				if (isMultiplicative) {
					statData[key].reforgeMultiplicative *= value.amount;
				} else {
					statData[key].reforgeAdditive += value.amount;
				}
			} else {
				if (isMultiplicative) {
					statData[key].modMultiplicative *= value.amount;
				} else {
					statData[key].modAdditive += value.amount;
				}
			}
		}
	}

	// Helper function to round to avoid floating point errors
	const round = (num: number, decimals: number = 2): number => {
		return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
	};

	// Compute final stats: (base + additive) * multiplicative
	for (const key in statData) {
		const data = statData[key];

		// Calculate final value: (base + additive) * multiplicative
		const totalAdditive = data.modAdditive + data.reforgeAdditive;
		const totalMultiplicative = data.modMultiplicative * data.reforgeMultiplicative;

		const baseWithAdditive = data.base + totalAdditive;
		const finalValue = baseWithAdditive * totalMultiplicative;

		stats[key] = {
			base: round(data.base),
			added: round(finalValue - data.base)
		};
	}

	return stats;
}

export const itemRegistry: Record<string, Item> = {};

export function initializeItemRegistry() {
	if (Object.keys(itemRegistry).length > 0) return; // Already initialized
	initializeModifierRegistry(); // Initialize modifiers first

	const items = import.meta.glob('$lib/items/**/*', { eager: true, as: 'raw' });

	for (const item in items) {
		const id = item
			.split('/')
			.pop()!
			.replace(/\.[^/.]+$/, '');
		let _item = (items[item] as any).default ?? items[item];
		itemRegistry[id] = parseYAMLToItem(_item);
	}
}
