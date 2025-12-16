import { EmptyEquipment, hydrateEquipment, type Equipment } from "$lib/types/equipment";
import type { Item } from "$lib/types/item";
import numeral from "numeral";
import { hydrateInventory } from "./item";

export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deepClone<T>(item: T): T {
    if (item === undefined || item === null) return item;
    try {
        return JSON.parse(JSON.stringify(item));
    } catch (e) {
        console.error('deepClone error:', e, item);
        return item;
    }
}

export function capitalizeAfterSpaces(str: String): String {
    return str.replace(/(^|\s)[a-z]/gi, (l) => l.toUpperCase());
}

export function capitalizeFirstLetter(str: string): string {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

export async function getInventory(id: string): Promise<Item[]> {
    let inventory: Item[] = [];

    const loadInventory = await fetch(`/api/inventory/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async (response) => {
            let responseJson = await response.json();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return responseJson;
        })
        .then(async (data) => {
            inventory = data.inventory;
        })
        .catch((error) => {
            console.error(error);
        });
    return hydrateInventory(inventory);
}

export async function getEquipment(id: string): Promise<Equipment> {
    // Load equipment
    let equipment = EmptyEquipment;

    const loadEquipment = await fetch(`/api/equipment/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async (response) => {
            let responseJson = await response.json();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return responseJson;
        })
        .then(async (data) => {
            equipment = data.equipment;
        })
        .catch((error) => {
            console.error(error);
        });

    return hydrateEquipment(equipment);
}

export async function getIdFromUsername(username: string): Promise<string> {
    // Load equipment
    let id: string = "";

    const loadId = await fetch(`/api/id/${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async (response) => {
            let responseJson = await response.json();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return responseJson;
        })
        .then(async (data) => {
            id = data.id;
        })
        .catch((error) => {
            console.error(error);
        });

    return id;
}

export function formatNumber(num: number): string {
    return numeral(num).format('0,0[.]00A');
}