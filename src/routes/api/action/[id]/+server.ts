import { supabase } from "$lib/auth/supabaseClient";

export async function GET({ params, cookies }) {
    const { id } = params;

    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return Response.json({}, { status: 404, statusText: "No session found" });
    }

    let sessionParsed: any;
    try {
        sessionParsed = JSON.parse(sessionCookie);
    } catch {
        return Response.json({}, { status: 400, statusText: "Invalid session cookie" });
    }

    const refresh_token = sessionParsed.refresh_token;
    const { data: user_data, error: user_error } = await supabase.auth.refreshSession({ refresh_token });

    if (user_error || !user_data?.user || user_data.user.id !== id) {
        return Response.json({}, { status: 401, statusText: "Unauthorized" });
    }

    const { data, error } = await supabase
        .from("actions")
        .select("*")
        .eq("player_id", id);

    if (error) throw new Error(error.message);

    if (data.length == 1) {
        return Response.json({ queue: data[0].queue, started: data[0].started_at }, { status: 200 });
    }

    return Response.json({ queue: undefined, started: undefined }, { status: 404 });
}

export async function POST({ request, params, cookies }) {
    const { id } = params;
    const { actionID } = await request.json();

    // Load supabase session
    const sessionCookie = cookies.get("supabase.session");
    if (!sessionCookie) {
        return Response.json({}, { status: 404, statusText: "No session found" });
    }

    let sessionParsed: any;
    try {
        sessionParsed = JSON.parse(sessionCookie);
    } catch {
        return Response.json({}, { status: 400, statusText: "Invalid session cookie" });
    }

    const refresh_token = sessionParsed.refresh_token;
    const { data: user_data, error: user_error } = await supabase.auth.refreshSession({ refresh_token });

    if (user_error || !user_data?.user || user_data.user.id !== id) {
        return Response.json({}, { status: 401, statusText: "Unauthorized" });
    }

    /**
     * loading from the action
     * repository will go here once it is created
     */
}