import { supabase } from "$lib/auth/supabaseClient";

export async function load({ cookies }) {
    const session = cookies.get("supabase.session");
    if (!session) return { user: null };

    const { user } = JSON.parse(session);
    return { user };
};