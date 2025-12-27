import { supabase } from "$lib/auth/supabaseClient";

export async function GET({ params }) {
    const { id } = params;

    const { data, error } = await supabase
        .from("skills")
        .select("skills_data")
        .eq("player_id", id);

    if (error) {
        throw new Error(`${error.message}`);
    }

    if (data.length == 1) {
        return Response.json({ skills: data[0].skills_data }, { status: 200 });
    }

    return Response.json({ skills: undefined }, { status: 404 });
}