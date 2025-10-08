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

    if (data.length == 1) {
        return Response.json({ inventory: data[0].inventory_data }, { status: 200 });
    }

    return Response.json({ inventory: undefined }, { status: 404 });
}