import { command, getRequestEvent, query } from "$app/server";
import { combatTick } from "$lib/server/combat";
import type { ICombatState } from "$lib/types/combat";
import { redirect } from "@sveltejs/kit";
import * as z from "zod";

export const getPlayerInstance = query(async () => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        redirect(307, "/");
    }

    const { data, error } = await locals.supabase
        .from("combat_instances_players")
        .select("room_id")
        .eq("player_id", locals.user.id)
        .single();

    if (error) throw new Error(error.message);

    if (!data) return null;

    return data.room_id;
});

export const getInstance = query(z.uuidv4(), async (id) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        redirect(307, "/");
    }

    const { data, error } = await locals.supabase
        .from("combat_instances")
        .select("combat_data")
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);

    if (!data) return null;

    return data.combat_data as ICombatState;
});

export const tickCombatInstance = command(z.uuidv4(), async (id) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        redirect(307, "/");
    }

    const instance = await getInstance(id);
    if (!instance) throw new Error(`Instance ${id} does not exist`);

    const previousTick = instance.previousTick;

    if (previousTick > Date.now() - 10_000) {
        return {
            "nextTick": (previousTick + 10_000) - Date.now(),
            "message": "Combat has not progressed to next tick"
        };
    }

    const state = await combatTick(instance);

    const { error } = await locals.supabase
        .from("combat_instances")
        .update({
            combat_data: state
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    return { state, nextTick: 10_000 };

});