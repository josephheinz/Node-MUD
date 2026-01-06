import * as _ from 'radashi';
import type { StatList } from './stats';
import { encodeDBItem, loadDbItem } from '$lib/utils/item';
import { initializeModifierRegistry, instantiateModifier, modifierRegistry } from '$lib/modifiers/modifiersRegistry';
import { parse } from 'yaml';

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
	Common = '#bdbdbd',
	Uncommon = '#32a852',
	Rare = '#5b8dfa',
	Epic = '#d335f3',
	Legendary = '#dbd82b',
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
};

export type DBItem = {
	id: string;
	modifiers?: string[];
};

export type DBInventory = DBItem[];

export class Inventory {
	private _contents: Array<Item>;

	constructor(initalContents: Item[]) {
		this._contents = initalContents;
	}

	public get contents(): Item[] {
		return this._contents;
	}

	public add(item: Item, index?: number): Item[] {
		if (index && (index < 0 || index > this._contents.length - 1))
			throw new Error(`Index ${index} is out of bounds: 0-${this._contents.length - 1}`);

		if (!index) this._contents.push(item);
		else {
			const firstPart: Item[] = this._contents.splice(0, index + 1);
			const lastPart: Item[] = this._contents.splice(index, this._contents.length - index);
			this._contents = [...firstPart, item, ...lastPart];
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
		head?: Item;
		body?: Item;
		legs?: Item;
		offhand?: Item;
		mainhand?: Item;
		necklace?: Item;
		ring?: Item;
		hands?: Item;
	}) {
		// Holy vomit
		// maybe ill figure out a better way to do this in the future
		this._head = initValues.head ? initValues.head : null;
		this._body = initValues.body ? initValues.body : null;
		this._legs = initValues.legs ? initValues.legs : null;
		this._offhand = initValues.offhand ? initValues.offhand : null;
		this._mainhand = initValues.mainhand ? initValues.mainhand : null;
		this._necklace = initValues.necklace ? initValues.necklace : null;
		this._ring = initValues.ring ? initValues.ring : null;
		this._hands = initValues.hands ? initValues.hands : null;
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

			equipment[slot] = loadDbItem(item);
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

	return {
		uid: crypto.randomUUID(),
		id: item.id,
		name: item.name,
		rarity: Rarity[item.rarity as RarityKey],
		icon: item.icon.image,
		modifiers,
		baseStats: item.stats,
		desc: item.description
	};
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
