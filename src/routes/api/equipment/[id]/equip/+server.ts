import { supabase } from "$lib/auth/supabaseClient";

export async function POST({ request, params }) {
    const { id } = params;
    const { item } = await request.json();

    return Response.json({ test: true });
}