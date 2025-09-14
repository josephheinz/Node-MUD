import { supabase } from "$lib/auth/supabaseClient";

export async function load({ params }) {
    const { username } = params;

    const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq('username', username);

    if (error) {
        throw new Error(`${JSON.stringify(error)}`);
    }

    if (data.length == 1) {
        return { profile: data[0] };
    }

    return { profile: undefined };
};