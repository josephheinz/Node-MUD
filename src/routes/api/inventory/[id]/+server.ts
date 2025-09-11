import { supabase } from "$lib/auth/supabaseClient";

export async function GET({ params }) {
    const { id } = params;

    const { data, error } = await supabase
        .from("inventories")
        .select("inventory_data")
        .eq("player_id", id);

    if (error) {
        throw new Error(`${error.message}`);
    }

    return Response.json({ inventory: data }, { status: 200 });
}