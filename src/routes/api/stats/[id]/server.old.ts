import { supabase } from "$lib/auth/supabaseClient";

export async function GET({ params }) {
    const { id } = params;

    const { data, error } = await supabase
        .from("inventories")
        .select("stats_data")
        .eq("player_id", id);

    if (error) {
        throw new Error(`${error.message}`);
    }

    if (data.length == 1) {
        return Response.json({ stats: data[0].stats_data }, { status: 200 });
    }

    return Response.json({ stats: undefined }, { status: 404 });
}