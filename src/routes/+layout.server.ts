import { supabase } from '$lib/auth/supabaseClient.js';
import type Equipment from '$lib/components/equipment.svelte';
import { loadDbItem, type DBItem, type Item } from '$lib/items.js';
import { EmptyEquipment, type EquipmentSlot } from '$lib/types.js';

export async function load({ cookies, fetch }) {
    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) return { user: null };

    let sessionParsed = JSON.parse(sessionCookie);

    const refresh_token = sessionParsed.refresh_token;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
        throw new Error(error.message);
    }

    const { session, user } = data;

    // Load inventory
    const userId = user?.id;

    let inventory: Item[] = [];

    const loadInventory = await fetch(`/api/inventory/${userId}`, {
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
            console.log('Success:', data);
            data.inventory.forEach(async (item: DBItem) => {
                let loadedItem = await loadDbItem(item);
                inventory.push(loadedItem);
            });
        })
        .catch((error) => {
            console.error(error);
        });

    // Load equipment
    let equipment = new EmptyEquipment();

    const loadEquipment = await fetch(`/api/equipment/${userId}`, {
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
            console.log(`Success: ${JSON.stringify(data)}`);
            for (const [slotKey, item] of Object.entries(data.equipment) as [
                EquipmentSlot,
                Item | undefined
            ][]) {
                if (!item) continue;
                let loadedItem = await loadDbItem(item);
                data.equipment[slotKey] = loadedItem;
            }
            equipment = data.equipment;
        })
        .catch((error) => {
            console.error(error);
        });


    return { user, inventory, equipment };
};