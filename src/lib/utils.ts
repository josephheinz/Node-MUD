import { get } from "svelte/store";
import type { Equipment, EquipmentSlot } from "./types/equipment";
import { itemRegistry, type DBItem, type IItemModifier, type Item } from "./types/item";
import * as store from "$lib/store";
import { instantiateModifier, instantiateModifierFromClass } from "./modifiers/modifiersRegistry";

export function extractItemsFromMessage(message: string): (string | Item)[] {
    const result: (string | Item)[] = [];
    let cursor = 0;

    while (true) {
        const start = message.indexOf("[item:", cursor);
        if (start === -1) {
            // push remaining text
            result.push(message.slice(cursor));
            break;
        }

        // push text before item
        if (start > cursor) result.push(message.slice(cursor, start));

        let depth = 0;
        let end = start + 6; // position after "[item:"
        let inString = false;

        while (end < message.length) {
            const char = message[end];

            if (char === '"' && message[end - 1] !== "\\") {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') depth++;
                else if (char === '}') depth--;

                if (depth === 0) break;
            }
            end++;
        }

        const jsonStr = message.slice(start + 6, end + 1); // include final }
        try {
            result.push(JSON.parse(jsonStr) as Item);
        } catch {
            result.push("[item:" + jsonStr + "]");
        }

        cursor = end + 2; // position after closing ]
    }

    return result;
}

export function linkToChat(
    itemLinkTable: Record<number, Item>,
    message: string,
    item: Item
): { message: string, itemLinkTable: Record<number, Item> } {
    const nextIndex = Object.keys(itemLinkTable).length + 1;
    message += `[ItemLink#${nextIndex}]`;
    itemLinkTable[nextIndex] = item;
    return { message, itemLinkTable };
}

export function deepClone<T>(item: T): T {
    return JSON.parse(JSON.stringify(item));
}

export function capitalizeFirstLetter(str: string): string {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

export function ConglomerateItems(inventory: Item[], equipment: Equipment): Item[] {
    let inventoryCopy: Item[] = deepClone<Item[]>(inventory);
    let result: Item[] = [];

    inventoryCopy.forEach((item: Item) => {
        item.modifiers = reviveModifiers(item.modifiers);
        result.push(item as Item);
    })

    Object.values(deepClone<Equipment>(equipment)).forEach((item: Item | null) => {
        if (item) {
            // re-instantiate all modifiers so methods exist
            item.modifiers = reviveModifiers(item.modifiers);
            result.push(item as Item);
        }
    });

    return result;
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
    base.uid = crypto.randomUUID();
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

export function hydrateInventory(inventory: DBItem[]): Item[] {
    let hydratedInventory: Item[] = [];

    inventory.forEach((item: DBItem) => {
        let loadedItem = loadDbItem(item);
        hydratedInventory.push(loadedItem);
    });

    return hydratedInventory;
}

export function reviveModifiers(mods: IItemModifier[]): IItemModifier[] {
    return mods.map(mod => instantiateModifierFromClass(mod));
}