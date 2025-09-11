import { supabase } from '$lib/auth/supabaseClient.js';

export async function load({ cookies }) {
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) return { user: null };

    let sessionParsed = JSON.parse(sessionCookie);

    const refresh_token = sessionParsed.refresh_token;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
        throw new Error(error.message);
    }

    const { session, user } = data;

    return { user };
};