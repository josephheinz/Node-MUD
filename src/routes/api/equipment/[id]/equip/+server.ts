import { supabase } from "$lib/auth/supabaseClient";
import type { InventoryRow } from "$lib/types.svelte";
import { serializeEquipment, type Equipment, type EquipmentSlot } from "$lib/types/equipment";
import { type DBItem, type Item } from "$lib/types/item";
import { determineSlot, encodeDbItem, loadDbItem } from "$lib/utils/item";

/**
 * Handle equipping an item from a player's inventory and persist the updated inventory and equipment.
 *
 * Authenticates the player using the "supabase.session" cookie, removes the specified `dbItem` from the player's inventory, determines the appropriate equipment slot, moves any previously equipped item back into the inventory, stores the new item in the slot, and updates the database.
 *
 * @param request - The incoming request; must contain a JSON body with `dbItem` (the item to equip).
 * @param params - Route parameters; `params.id` must be the player's id.
 * @returns A Response containing the updated `inventory` and `serializedEquipment` on success; on failure returns a Response with an appropriate HTTP status and JSON error details. 
 */
export async function POST({ request, params, cookies }) {
    const { id } = params;
    const { dbItem } = await request.json();

    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return Response.json({}, { status: 404, statusText: "No session found" });
    }

    let sessionParsed: any;
    try {
        sessionParsed = JSON.parse(sessionCookie);
    } catch {
        return Response.json({}, { status: 400, statusText: "Invalid session cookie" });
    }

    const refresh_token = sessionParsed.refresh_token;
    const { data: user_data, error: user_error } = await supabase.auth.refreshSession({ refresh_token });

    if (user_error || !user_data?.user || user_data.user.id !== id) {
        return Response.json({}, { status: 401, statusText: "Unauthorized" });
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