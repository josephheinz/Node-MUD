import { json, type RequestHandler, type RequestEvent } from "@sveltejs/kit";
import { supabase } from "$lib/supabaseClient";

export async function POST({ request }) {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error != null) {
        console.warn(error);
        return Response.json({ success: false, msg: error.message }, { status: error.status });
    }

    return Response.json({ success: true }, { status: 200 });
}