import { supabase } from "$lib/auth/supabaseClient";
import { actionRegistry, getAction, type Action, type DBQueueAction } from "$lib/types/action.js";

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
    const { actionID, amount = 1 }: { actionID: string; amount: Number; } = await request.json();

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

    // Load and update user's action queue
    const action: Action | null = getAction(actionID);
    if (!action) return Response.json({}, { status: 400, statusText: "Provided action ID not found in action registry" });

    const dbAction: DBQueueAction = { action, amount };

    const { data: getData, error: getError } = await supabase
        .from("actions")
        .select("*")
        .eq("player_id", id);

    if (!getData || getError) throw new Error(getError.message);

    const currentQueue: DBQueueAction[] = getData[0].queue as DBQueueAction[];

    const updatedQueue: DBQueueAction[] = [...currentQueue, dbAction];

    const { data: setData, error: setError } = await supabase
        .from("actions")
        .update({ queue: updatedQueue })
        .eq("player_id", id)
        .select();

    if (!setData || setError) throw new Error(setError.message);

    return Response.json({ queue: setData[0].queue }, { status: 200 });
}