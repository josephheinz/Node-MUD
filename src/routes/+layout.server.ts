import { supabase } from '$lib/auth/supabaseClient.js';
import { type Item } from '$lib/types/item.js';
import { Stats } from '$lib/types/stats.js';
import { EmptyEquipment } from '$lib/types/equipment';
import type { DBQueueAction } from '$lib/types/action.js';

export async function load({ cookies, fetch }) {
    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return {
            user: null,
            inventory: [],
            equipment: EmptyEquipment,
            stats: Stats,
            queue: []
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

    // Update last time logged in
    const { data: d, error: e } = await supabase
        .from("profiles")
        .update({ last_logged_in: new Date(Date.now()) })
        .eq("id", user.id);

    if (e) {
        console.log(e);
    }

    // Load inventory
    const userId = user?.id;

    let queue: DBQueueAction[] = [];
    let started: Date = new Date(Date.now());

    const loadQueue = await fetch(`/api/action/${userId}`, {
        method: "GET",
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
            queue = data.queue;
            started = data.started;
            console.log(started)
        })
        .catch((error) => {
            console.error(error);
        });

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

    let stats = { ...Stats };

    const loadStats = await fetch(`/api/stats/${userId}`, {
        method: "GET",
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
            stats = data.stats;
        })
        .catch((error) => {
            console.error(error);
        });


    return { user, inventory, equipment, stats, queue, started };
};