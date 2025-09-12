import { parse } from "yaml";
import * as path from "path";
import { type ITooltipData } from "./components/tooltip";
import { instantiateModifier } from "./modifiers/modifiersRegistry";
import { type Equipment, EmptyEquipment, type EquipmentSlot } from "./types";

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
    Common = "#bdbdbd",
    Uncommon = "#32a852",
    Rare = "#3258a8",
    Epic = "#b34ec7",
    Legendary = "#dbd82b",
    Mythic = "#fc6ae2",
    Divine = "#3ad4e8"
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

    return {
        title: itemName,
        body: `${itemDesc}<br>${descriptor}`
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

export async function loadDbItem(item: DBItem): Promise<Item> {
    const base = itemRegistry[item.id];
    if (!base) throw new Error(`Unknown item id: ${item.id}`);

    const playerModifiers = item.modifiers?.map(instantiateModifier) ?? [];

    return {
        ...base,
        // merge modifiers: base first, then player ones
        modifiers: [...base.modifiers, ...playerModifiers]
    };
}

export async function hydrateEquipment(equipment: Object): Promise<Equipment> {
    const hydratedEquipment: Equipment = EmptyEquipment;

    for (const [slotKey, item] of Object.entries(equipment) as [
        EquipmentSlot,
        Item | undefined
    ][]) {
        if (!item) continue;
        let loadedItem = await loadDbItem(item);
        hydratedEquipment[slotKey] = loadedItem;
    }

    return hydratedEquipment;
}

export async function hydrateInventory(inventory: DBItem[]): Promise<Item[]> {
    let hydratedInventory: Item[] = [];

    inventory.forEach(async (item: DBItem) => {
        let loadedItem = await loadDbItem(item);
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