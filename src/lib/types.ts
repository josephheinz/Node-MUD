import { encodeDbItem, hydrateEquipment, hydrateInventory, type DBItem, type Item } from "./items";
import * as store from "$lib/store";
import { get } from "svelte/store";

export type EquipmentSlot = keyof Equipment;

export type Equipment = {
    head: Item | null;
    body: Item | null;
    legs: Item | null;
    offhand: Item | null;
    mainhand: Item | null;
};

export const EmptyEquipment: Equipment = {
    head: null,
    body: null,
    legs: null,
    offhand: null,
    mainhand: null
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

    const res = await fetch(`/api/equipment/${userId}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbItem: encodeDbItem(item) })
    });

    if (!res.ok) {
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

    try {
        const response = await fetch(`/api/equipment/${get(store.user)?.id}/unequip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Unequip failed');

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
