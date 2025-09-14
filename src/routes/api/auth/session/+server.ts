import { supabase } from "$lib/auth/supabaseClient";

export async function GET({ cookies }) {
    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) return Response.json({ user: null }, { status: 404 });

    let sessionParsed = JSON.parse(sessionCookie);

    const refresh_token = sessionParsed.refresh_token;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
        console.log(error.message);
    }

    const { session, user } = data;

    return Response.json({ session, user }, { status: 200 });
}