import { supabase } from "$lib/auth/supabaseClient";

/**
 * Refreshes the Supabase session using the "supabase.session" cookie, updates the user's `last_logged_in` timestamp, and returns the refreshed session and user.
 *
 * If the session cookie is missing, responds with a 404 and `{ user: null }`.
 *
 * @param param0 - An object containing the request `cookies` store used to read the session cookie
 * @returns A Response with JSON: on success `{ session, user }` and status 200; if no session cookie, `{ user: null }` with status 404.
 */
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

    const { data: d, error: e } = await supabase
        .from("profiles")
        .update({ last_logged_in: new Date(Date.now()) })
        .eq("id", data.user?.id);

    if (e) {
        console.log(e);
    }

    const { session, user } = data;

    return Response.json({ session, user }, { status: 200 });
}