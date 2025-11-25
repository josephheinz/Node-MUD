import { type DBItem, type Item } from "$lib/types/item";
import { getModifiedStats } from "$lib/types/stats";
import * as store from "$lib/store";
import { get } from "svelte/store";
import { determineSlot, encodeDbItem, hydrateInventory, loadDbItem } from "$lib/utils/item";

export type EquipmentSlot = keyof Equipment;

export type Equipment = {
    head: Item | null;
    body: Item | null;
    legs: Item | null;
    offhand: Item | null;
    mainhand: Item | null;
    necklace: Item | null;
    ring: Item | null;
    hands: Item | null;

};

export const EmptyEquipment: Equipment = {
    head: null,
    body: null,
    legs: null,
    offhand: null,
    mainhand: null,
    necklace: null,
    ring: null,
    hands: null
};

export async function Equip(item: Item) {
    const userId = get(store.user)?.id;

    if (!userId) return console.error('No user logged in');

    const startInventory = get(store.inventory);
    const startEquipment = get(store.equipment);

    let changeInventory = startInventory;
    let changeEquipment = startEquipment;

    try {
        let slot: EquipmentSlot | undefined = determineSlot(item);
        const index = startInventory.findIndex(i => i.uid === item.uid);
        if (index === -1) {
            throw new Error("Item not in inventory");
        }
        if (slot) {
            if (startEquipment[slot]) changeInventory.push(startEquipment[slot]);
            changeEquipment[slot] = item;
            changeInventory.splice(index, 1);
        }

        store.inventory.set(changeInventory);
        store.equipment.set(changeEquipment);
    } catch (err) {
        console.log(err);
    }

    const res = await fetch(`/api/equipment/${userId}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbItem: encodeDbItem(item) })
    });

    if (!res.ok) {
        store.inventory.set(startInventory);
        store.equipment.set(startEquipment);
        console.error('Failed to equip');
        return;
    }

    const data = await res.json();

    // Update client state with server response
    let newEq = hydrateEquipment(data.serializedEquipment);
    let newInv = hydrateInventory(data.inventory);
    store.equipment.set(newEq);
    store.inventory.set(newInv);
    store.modifiedStats.set(getModifiedStats(get(store.baseStats), newEq));
}

export async function Unequip(slot: keyof Equipment) {
    const currentItem = get(store.equipment)[slot];
    if (!currentItem) return;

    const startInventory = get(store.inventory);
    const startEquipment = get(store.equipment);

    let changeInventory = startInventory;
    let changeEquipment = startEquipment;

    try {
        changeInventory.push(currentItem);
        changeEquipment[slot] = null;

        store.inventory.set(changeInventory);
        store.equipment.set(changeEquipment);
    } catch (err) {
        console.log(err);
    }

    try {
        const res = await fetch(`/api/equipment/${get(store.user)?.id}/unequip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot })
        });

        const data = await res.json();
        if (!res.ok) {
            store.inventory.set(startInventory);
            store.equipment.set(startEquipment);
            throw new Error(data?.error || 'Unequip failed');
        }

        // Update client state with server response
        let newEq = hydrateEquipment(data.equipment);
        let newInv = hydrateInventory(data.inventory);
        store.equipment.set(newEq);
        store.inventory.set(newInv);
        store.modifiedStats.set(getModifiedStats(get(store.baseStats), newEq));
    } catch (err) {
        console.error('Unequip error:', err);
    }
}

export async function Reforge(item: Item): Promise<Item | null> {
    const userId = get(store.user)?.id;

    if (!userId) console.error('No user logged in');

    const res = await fetch(`/api/item/${userId}/reforge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbItem: encodeDbItem(item) })
    });

    if (!res.ok) {
        console.error('Failed to reforge');
        return null;
    }

    const data = await res.json();
    // Update client state with server response
    let newEq = hydrateEquipment(data.serializedEquipment);
    let newInv = hydrateInventory(data.inventory);

    store.equipment.set(newEq);
    store.inventory.set(newInv);
    store.modifiedStats.set(getModifiedStats(get(store.baseStats), newEq));

    return loadDbItem(data.updatedItem);
}

export function serializeEquipment(equipment: Record<string, Item | null>): Record<string, DBItem | null> {
    const result: Record<string, DBItem | null> = {};
    for (const slot in equipment) {
        const item = equipment[slot];
        result[slot] = item != null ? encodeDbItem(item) : null;
    }
    return result;
}

export function hydrateEquipment(equipment: Object): Equipment {
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