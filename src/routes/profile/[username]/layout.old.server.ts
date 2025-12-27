import { supabase } from "$lib/auth/supabaseClient";
import type { User } from "@supabase/supabase-js";

export interface IApiSettings {
    profile_id: string;
    inventory_api: boolean;
    equipment_api: boolean;
}

export async function load({ params, cookies }) {
    const { username } = params;

    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    let finalUser: User | undefined;
    let apiSettings: IApiSettings | undefined;

    if (sessionCookie) {

        let sessionParsed = JSON.parse(sessionCookie);

        const refresh_token = sessionParsed.refresh_token;
        const { data: userData, error: userError } = await supabase.auth.refreshSession({ refresh_token });

        if (userError) {
            console.log(userError.message);
        }

        const { session, user } = userData;

        if (user) finalUser = user;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq('username', username);

    if (error) {
        throw new Error(`${JSON.stringify(error)}`);
    }

    const { data: apiData, error: apiError } = await supabase
        .from("profile_settings")
        .select("*")
        .eq('profile_id', finalUser?.id ?? data[0].id);

    if (apiData) apiSettings = apiData[0];

    if (data.length == 1) {
        return { profile: data[0], user: finalUser, api_settings: apiSettings };
    }

    return { profile: undefined, user: finalUser, api_settings: apiSettings };
};