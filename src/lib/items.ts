import { parse } from "yaml";
import * as store from "$lib/store";
import { type ITooltipData } from "./components/tooltip";
import { instantiateModifier } from "./modifiers/modifiersRegistry";
import { type Equipment, EmptyEquipment, type EquipmentSlot } from "./types";
import { get } from "svelte/store";

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
    Common = "#bdbdbd",
    Uncommon = "#32a852",
    Rare = "#5b8dfa",
    Epic = "#d335f3",
    Legendary = "#dbd82b",
    Mythic = "#fd89e8",
    Divine = "#3fe9ff",
    Special = "#ff5252"
};

export interface IItemModifier {
    type: string;
    value?: number | string | boolean;
    displayName?: string;
    modifyName?(baseName: string): string;
    modifyDescription?(baseDesc: string): string;
}

export interface DBItem {
    id: string;
    modifiers?: IItemModifier[];
}

export interface Item {
    uid: string;
    id: string;
    name: string;
    rarity: Rarity;
    desc?: string;
    icon: {
        ascii: string;
        image?: string;
    };
    modifiers: IItemModifier[];
}

export function parseYAMLToItem(yamlString: string): Item {
    let item = parse(yamlString)[0];
    const modifiers: IItemModifier[] = (item.modifiers || []).map(instantiateModifier)

    return {
        uid: crypto.randomUUID(),
        id: item.id,
        name: item.name,
        rarity: Rarity[item.rarity as RarityKey],
        icon: {
            ascii: item.icon.ascii,
            image: item.icon.image
        },
        modifiers
    };
}

export function getItemData(item: Item): ITooltipData {
    let rarityName: string = getRarity(item.rarity);
    let descriptor: string = `<b style="color:${item.rarity}">${rarityName} Item</b>`;

    let itemName: string = getDisplayName(item);
    let itemDesc: string = getDisplayDescription(item);

    let slot: EquipmentSlot | undefined = determineSlot(item);
    let equipMsg: string = "";
    if (slot) equipMsg = `[Equip - Double-click]<br/>Slot: ${slot}<br/>`;

    return {
        title: itemName,
        body: `${equipMsg}${itemDesc}<br/>${descriptor}`
    }
}

export function getRarity(color: string): string {
    const rarity = Object.keys(Rarity).find(k => Rarity[k as keyof typeof Rarity] === color) ?? Rarity.Common;
    return rarity;
}

export function getDisplayName(item: Item): string {
    return item.modifiers?.reduce(
        (name, mod) => mod.modifyName ? mod.modifyName(name) : item.name,
        item.name
    ) ?? item.name;
}

export function getDisplayDescription(item: Item): string {
    const base = item.desc ?? "";
    return item.modifiers?.reduce(
        (desc, mod) => mod.modifyDescription ? mod.modifyDescription(desc) : desc,
        base
    ) ?? base;
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

export function loadDbItem(item: DBItem): Item {
    const base = itemRegistry[item.id];
    if (!base) throw new Error(`Unknown item id: ${item.id}`);

    const playerModifiers = item.modifiers?.map(instantiateModifier) ?? [];

    return {
        ...base,
        // merge modifiers: base first, then player ones
        modifiers: [...base.modifiers, ...playerModifiers]
    };
}

export function encodeDbItem(item: Item): DBItem {
    const base = itemRegistry[item.id];

    // Use both type + value (or the whole object) to compare
    const baseMods = new Set(
        (base.modifiers ?? []).map(m => JSON.stringify(m))
    );

    return {
        id: item.id,
        modifiers: (item.modifiers ?? []).filter(
            mod => !baseMods.has(JSON.stringify(mod))
        )
    };
}


export function determineSlot(item: Item, equipment: Equipment = get(store.equipment)): EquipmentSlot | undefined {
    let slot: EquipmentSlot | undefined = undefined;

    item.modifiers.forEach((mod: IItemModifier) => {
        if (mod.type !== "Equippable" || !mod.value || typeof mod.value !== "string") return;
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

export async function hydrateEquipment(equipment: Object): Promise<Equipment> {
    const hydratedEquipment: Equipment = { ...EmptyEquipment };

    for (const [slotKey, item] of Object.entries(equipment) as [
        EquipmentSlot,
        Item | null
    ][]) {
        if (!item) continue;
        let loadedItem = loadDbItem(item);
        hydratedEquipment[slotKey] = loadedItem;
    }

    return hydratedEquipment;
}

export async function hydrateInventory(inventory: DBItem[]): Promise<Item[]> {
    let hydratedInventory: Item[] = [];

    inventory.forEach(async (item: DBItem) => {
        let loadedItem = loadDbItem(item);
        hydratedInventory.push(loadedItem);
    });

    return hydratedInventory;
}

// Load all the items for api

const items = import.meta.glob("./items/*", { eager: true, as: "raw" });

export const itemRegistry: Record<string, Item> = {};

// cant lie i dont know precisely how this works
async function loadAllItems() {
    for (const item in items) {
        const id = item.split("/").pop()!.replace(/\.[^/.]+$/, '');
        let _item = (items[item] as any).default ?? items[item];
        itemRegistry[id] = parseYAMLToItem(_item);
    }
}

await loadAllItems();