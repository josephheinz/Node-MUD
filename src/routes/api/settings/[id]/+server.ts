import { supabase } from '$lib/auth/supabaseClient';

export interface IProfileSetting {
    name: string;
    value: any;
}

export async function POST({ request, params, cookies }) {
    const { id } = params;
    const { setting }: { setting: IProfileSetting } = await request.json();

    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return new Response(JSON.stringify({ error: "No session" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
        });
    }

    let sessionParsed: any;
    try {
        sessionParsed = JSON.parse(sessionCookie);
    } catch {
        return new Response(JSON.stringify({ error: "Invalid session cookie" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const refresh_token = sessionParsed.refresh_token;
    const { data: user_data, error: user_error } = await supabase.auth.refreshSession({ refresh_token });

    if (user_error || !user_data?.user || user_data.user.id !== id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const { user } = user_data;

    const { data: settings, error } = await supabase
        .from("profile_settings")
        .update({ [setting.name]: setting.value })
        .eq("profile_id", user.id)
        .select("*");


    if (error) throw new Error("Error when updating: " + error);

    return Response.json({ settings: settings[0] }, {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

/**
 * Fetches the profile settings for the `id` route parameter and returns the first matching record.
 *
 * If a settings row is found, responds with JSON `{ settings: <row> }` and HTTP 200; if no settings are found or an error occurs, responds with JSON `{ status: 404 }`.
 *
 * @returns A `Response` containing `{ settings: <row> }` and status 200 when a record is found, or `{ status: 404 }` when not found or on error.
 */
export async function GET({ request, params }) {
    const { id } = params;

    const { data: settings, error } = await supabase
        .from("profile_settings")
        .select("*")
        .eq("profile_id", id);

    if (!settings || error) return Response.json({ status: 404 });

    return Response.json({ settings: settings[0] }, {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}