import { supabase } from "$lib/auth/supabaseClient";

export async function GET({ params }) {
    const { username } = params;

    const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username);

    if (error) {
        throw new Error(`${error.message}`);
    }

    if (data.length == 1) {
        return Response.json({ id: data[0].id }, { status: 200 });
    }

    return Response.json({ id: undefined }, { status: 404 });
}