import { supabase } from "$lib/auth/supabaseClient";
import type { DBEquipment, Equipment, EquipmentSlot } from "$lib/types/equipment";
import { type DBItem, type Item } from "$lib/types/item.js";
import { encodeDbItem } from "$lib/utils/item.js";

export async function POST({ request, params, cookies }) {

    const { id } = params;
    const { slot } = await request.json();

    // Load Supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return new Response(JSON.stringify({ error: "No session" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    let sessionParsed: any;
    try {
        sessionParsed = JSON.parse(sessionCookie);
    } catch {
        return new Response(JSON.stringify({ error: "Invalid session cookie" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const refresh_token = sessionParsed.refresh_token;
    const { data: user_data, error: user_error } = await supabase.auth.refreshSession({ refresh_token });

    if (user_error || !user_data?.user || user_data.user.id !== id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Fetch current inventory/equipment
    const { data, error: fetchError } = await supabase
        .from("inventories")
        .select("inventory_data, equipment_data")
        .eq("player_id", id)
        .single();

    if (fetchError || !data) {
        return new Response(JSON.stringify({ error: fetchError?.message || "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    let inventory: DBItem[] = data.inventory_data ?? [];
    let equipment: DBEquipment = data.equipment_data ?? {
        head: undefined,
        body: undefined,
        legs: undefined,
        offhand: undefined,
        mainhand: undefined,
    };

    const item: DBItem | null = equipment[slot as EquipmentSlot];
    if (!item) {
        return new Response(JSON.stringify({ error: "No item in slot" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Unequip item
    equipment[slot as EquipmentSlot] = null;
    inventory.push(item);

    // Update Supabase
    const { data: updateData, error: updateError } = await supabase
        .from("inventories")
        .update({
            inventory_data: inventory,
            equipment_data: equipment,
        })
        .eq("player_id", id)
        .select();

    if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ inventory, equipment }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
