import { supabase } from "$lib/auth/supabaseClient";
import { getAction, type Action, type DBQueueAction } from "$lib/types/action.js";
import type { DBItem, Item } from "$lib/types/item";
import { getInventoryCounts, processQueue, removeInputsFromInventory } from "$lib/utils/action.js";
import { encodeDbItem } from "$lib/utils/item.js";
import { getItem } from "$lib/types/item";

export async function GET({ params, cookies }) {
    const { id } = params;

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

    const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("player_id", id);

    if (error) throw new Error(error.message);

    if (data.length == 1) {
        const processedQueue = processQueue(data[0].queue, data[0].started_at);
        const { data: invData, error: invError } = await supabase
            .from("inventories")
            .select("inventory_data")
            .eq("player_id", id);

        if (invError) throw new Error(invError.message);

        // Inventory is an array of Item objects
        const inventory: Item[] = invData[0].inventory_data;

        // Combining old inventory with new outputs from the queue
        const updatedInv: Item[] = [...inventory, ...processedQueue.outputs];
        let updatedDBInv: DBItem[] = [];

        updatedInv.forEach((item: Item) => {
            updatedDBInv.push(encodeDbItem(item));
        });

        const updatedQueue: DBQueueAction[] = processedQueue.queue;

        if (data[0].started_at != null && updatedQueue.length <= 0) {
            const { error: updateStartErr } = await supabase
                .from("actions")
                .update({ started_at: null })
                .eq("player_id", id);

            if (updateStartErr) throw new Error(updateStartErr.message);
        }

        const { error: updateInvErr } = await supabase
            .from("inventories")
            .update({ inventory_data: updatedDBInv })
            .eq("player_id", id);
        if (updateInvErr) throw new Error(updateInvErr.message);

        const { error: updateQueueErr } = await supabase
            .from("actions")
            .update({ queue: updatedQueue })
            .eq("player_id", id);
        if (updateQueueErr) throw new Error(updateQueueErr.message);

        return Response.json({ queue: updatedQueue, started: data[0].started_at, inventory: updatedInv }, { status: 200 });
    }

    return Response.json({ queue: undefined, started: undefined }, { status: 404 });
}

export async function POST({ request, params, cookies }) {
    const { id } = params;
    const { actionID, amount = 1 }: { actionID: string; amount: number; } = await request.json();

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

    // Load and update user's action queue
    const action: Action | null = getAction(actionID);
    if (!action) return Response.json({}, { status: 400, statusText: "Provided action ID not found in action registry" });

    const dbAction: DBQueueAction = { action, amount };

    const { data: invData, error: invErr } = await supabase
        .from("inventories")
        .select("inventory_data")
        .eq("player_id", id);

    if (!invData || invData.length <= 0) throw new Error("Player does not have an inventory, so inputs cannot be taken out");

    const inventory: Item[] = invData[0].inventory_data;

    let loadedInputs: { item: Item; amount: number }[] = [];

    // 1. Determine required inputs
    // NOTE: Action inputs use parallel arrays (ids and amounts). We need to combine them.
    for (let i = 0; i < action.inputs.ids.length; i++) {
        const itemId = action.inputs.ids[i];
        const requiredAmount = action.inputs.amounts[i] * amount; // Scale by queue amount
        const loadedItem: Item | null = getItem(itemId);

        // Push the item object and the total required amount
        if (loadedItem) {
            // Create a temporary Item object to represent the input requirement
            loadedInputs.push({ item: loadedItem, amount: requiredAmount });
        }
    }


    // 2. Check if all required inputs are present
    const inputsPresent = getInventoryCounts(inventory, loadedInputs);

    // Check if the player can afford all inputs
    const canAfford = inputsPresent.every(input => input.present >= input.required);

    // 🔥 CRITICAL FIX: Halt if inputs are insufficient
    if (!canAfford) {
        return Response.json({ status: "Insufficient items in inventory." }, { status: 403 });
    }

    // 3. Remove required inputs from inventory (only if affordable)
    // The utility function `removeInputsFromInventory` handles the array removal correctly 
    // for the item-per-slot inventory model.
    const updatedInventory: Item[] = removeInputsFromInventory(inventory, loadedInputs);

    // 4. Update Queue and Database (rest of the original logic)

    const { data: getData, error: getError } = await supabase
        .from("actions")
        .select("*")
        .eq("player_id", id);

    if (!getData || getError) throw new Error(getError.message);

    const currentQueue: DBQueueAction[] = getData[0].queue as DBQueueAction[];

    const updatedQueue: DBQueueAction[] = [...currentQueue, dbAction];
    const started_at: Date = getData[0].started_at ?? new Date(Date.now());

    const { data: setData, error: setError } = await supabase
        .from("actions")
        .update({ queue: updatedQueue, started_at })
        .eq("player_id", id)
        .select();

    // Must encode updated inventory array for the database
    let updatedDBInv: DBItem[] = [];
    updatedInventory.forEach((item: Item) => {
        updatedDBInv.push(encodeDbItem(item));
    });

    const { error: setInvErr } = await supabase
        .from("inventories")
        .update({ inventory_data: updatedDBInv })
        .eq("player_id", id);

    if (!setData || setError) throw new Error(setError.message);
    if (setInvErr) throw new Error(setInvErr.message);

    return Response.json({ queue: setData[0].queue, inventory: updatedInventory }, { status: 200 });
}