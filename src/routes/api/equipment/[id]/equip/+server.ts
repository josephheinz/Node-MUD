import { supabase } from "$lib/auth/supabaseClient";
import type { InventoryRow } from "$lib/types.svelte";
import { serializeEquipment, type Equipment, type EquipmentSlot } from "$lib/types/equipment";
import { type DBItem, type Item } from "$lib/types/item";
import { determineSlot, encodeDbItem, loadDbItem } from "$lib/utils/item";

export async function POST({ request, params, cookies }) {
    const { id } = params;
    const { dbItem } = await request.json();

    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return new Response(JSON.stringify({ error: "No session" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    let sessionParsed: any;
    try {
        sessionParsed = JSON.parse(sessionCookie);
    } catch {
        return new Response(JSON.stringify({ error: "Invalid session cookie" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const refresh_token = sessionParsed.refresh_token;
    const { data: user_data, error: user_error } = await supabase.auth.refreshSession({ refresh_token });

    if (user_error || !user_data?.user || user_data.user.id !== id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const { user } = user_data;

    // Fetch current inventory/equipment
    const { data, error: fetchError } = await supabase
        .from("inventories")
        .select("inventory_data, equipment_data")
        .eq("player_id", id)
        .single();

    if (fetchError || !data) {
        return new Response(JSON.stringify({ error: fetchError?.message || "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    const { inventory_data, equipment_data } = data as InventoryRow;

    const inventory: DBItem[] = inventory_data ?? [];
    const equipment: Equipment = equipment_data ?? {};

    // Find item in inventory
    const index = inventory.findIndex(i => i.id === dbItem.id);
    if (index === -1) {
        return new Response(JSON.stringify({ error: "Item not found in inventory" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    // Remove item from inventory
    inventory.splice(index, 1);

    // Load full item from dbItem
    const item: Item = loadDbItem(dbItem);

    // Determine slot
    const slot: EquipmentSlot | undefined = determineSlot(item, equipment);
    if (!slot) {
        return new Response(JSON.stringify({ error: "Item is not equippable" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    // If slot occupied, move current equipment to inventory
    if (equipment[slot]) {
        inventory.push(encodeDbItem(equipment[slot]!));
    }

    // Equip new item
    equipment[slot] = item;

    const serializedEquipment = serializeEquipment(equipment)

    // Update Supabase
    const { error: updateError } = await supabase
        .from("inventories")
        .update({ inventory_data: inventory, equipment_data: serializedEquipment })
        .eq("player_id", id);

    if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ inventory, serializedEquipment }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
