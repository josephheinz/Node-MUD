import { query } from "$app/server";
import { supabase } from "$lib/auth/supabaseClient";
import * as z from "zod"

export const getInventory = query(z.uuidv4(), async (id) => {
    const { data, error } = await supabase
        .from('inventories')
        .select('inventory_data')
        .eq('player_id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (data) {
        const inventory = data.inventory_data;
        return { inventory }
    }

    return { inventory: undefined };
})