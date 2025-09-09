import { supabase } from "$lib/auth/supabaseClient";

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