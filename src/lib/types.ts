import { determineSlot, encodeDbItem, hydrateEquipment, hydrateInventory, type DBItem, type Item } from "./items";
import * as store from "$lib/store";
import { get } from "svelte/store";
import ItemRenderer from "./components/itemRenderer.svelte";

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

export interface User {
    id: string;
};

export type InventoryRow = {
    inventory_data: DBItem[];
    equipment_data: Equipment;
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
    let newEq = await hydrateEquipment(data.serializedEquipment);
    let newInv = await hydrateInventory(data.inventory);
    store.equipment.set(newEq);
    store.inventory.set(newInv);
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
        let newEq = await hydrateEquipment(data.equipment);
        let newInv = await hydrateInventory(data.inventory);
        store.equipment.set(newEq);
        store.inventory.set(newInv);
    } catch (err) {
        console.error('Unequip error:', err);
    }
}

export function serializeEquipment(equipment: Record<string, Item | null>): Record<string, DBItem | null> {
    const result: Record<string, DBItem | null> = {};
    for (const slot in equipment) {
        const item = equipment[slot];
        result[slot] = item != null ? encodeDbItem(item) : null;
    }
    return result;
}
