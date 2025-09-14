import { supabase } from '$lib/auth/supabaseClient.js';
import { type Item } from '$lib/items.js';
import { EmptyEquipment } from '$lib/types.js';

export async function load({ cookies, fetch }) {
    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return {
            user: null,
            inventory: [],
            equipment: EmptyEquipment
        };
    }

    let sessionParsed = JSON.parse(sessionCookie);

    const refresh_token = sessionParsed.refresh_token;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
        console.log(error.message);
    }

    const { session, user } = data;

    if (!user) return { user, inventory: [], equipment: EmptyEquipment };

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
            inventory = data.inventory;
        })
        .catch((error) => {
            console.error(error);
        });

    // Load equipment
    let equipment = EmptyEquipment;

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
            equipment = data.equipment;
        })
        .catch((error) => {
            console.error(error);
        });


    return { user, inventory, equipment };
};