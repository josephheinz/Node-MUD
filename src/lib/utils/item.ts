import { EmptyEquipment, type Equipment, type EquipmentSlot } from "$lib/types/equipment";
import { itemRegistry, type DBItem, type IItemModifier, type Item } from "$lib/types/item";
import { deepClone } from "./general";
import { get } from "svelte/store";
import * as store from "$lib/store";
import { instantiateModifier, instantiateModifierFromClass } from "$lib/modifiers/modifiersRegistry";
import type { StackableModifier } from "$lib/modifiers/basicModifiers";

export function ConglomerateItems(inventory: Item[], equipment: Equipment): Item[] {
    let inventoryCopy: Item[] = deepClone<Item[]>(inventory) ?? [];
    let result: Item[] = [];

    inventoryCopy.forEach((item: Item) => {
        item.modifiers = reviveModifiers(item.modifiers);
        result.push(item as Item);
    })

    Object.values(deepClone<Equipment>(equipment) ?? EmptyEquipment).forEach((item: Item | null) => {
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
    const base = deepClone(itemRegistry[item.id]);
    if (!base) throw new Error(`Unknown item id: ${item.id}`);

    const overrides = item.modifiers ?? [];

    // Merge base modifiers with overrides
    const mergedModifiers = base.modifiers.map(baseMod => {
        const o = overrides.find(om => om.type === baseMod.type);
        return o ? { ...baseMod, ...o } : baseMod;
    });

    return {
        ...base,
        uid: crypto.randomUUID(),
        modifiers: mergedModifiers
    };
}

export function encodeDbItem(item: Item): DBItem {
    const base = itemRegistry[item.id];

    const encodedMods = [];

    for (const mod of item.modifiers ?? []) {
        const baseMod = base.modifiers.find(b => b.type === mod.type);

        if (!baseMod) {
            // Not a base modifier → store full modifier
            encodedMods.push(mod);
            continue;
        }

        // Compare field-by-field
        const diff: any = { type: mod.type };

        let changed = false;
        for (const key of Object.keys(mod) as (keyof IItemModifier)[]) {
            if (mod[key] !== baseMod[key]) {
                diff[key] = mod[key];
                changed = true;
            }
        }

        // Only store if anything actually changed
        if (changed) encodedMods.push(diff);
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
    return mods.map(mod => instantiateModifierFromClass(mod));
}

export function tryStackItemInInventory(item: Item, inventory: Item[]): Item[] {
    const stackableModifier: StackableModifier | undefined = item.modifiers.find(
        (m) => m.type == 'Stackable'
    ) as StackableModifier;

    if (!stackableModifier) {
        console.log("Item not stackable");
        inventory.push(item);
        return inventory;
    }

    const inventoryStacks: Item[] = inventory.filter(i => i.id === item.id);

    if (inventoryStacks.length === 0) {
        console.log("No items in inventory to stack onto");
        inventory.push(item);
        return inventory;
    }

    let updatedStackIndex: number = inventory.findIndex(i => i.id === item.id && (i.modifiers.find(m => m.type === "Stackable") as StackableModifier)?.value + stackableModifier.value < stackableModifier.stack);

    if (updatedStackIndex === -1) {
        inventory.push(item);
        return inventory;
    } else {
        const stackModifierIndex: number = inventory[updatedStackIndex].modifiers.findIndex(m => m.type === "Stackable");
        (inventory[updatedStackIndex].modifiers[stackModifierIndex] as StackableModifier).value += stackableModifier.value;
        return inventory;
    }
}