/*
    FUNCTIONS NEEDED

    query getPlayerInstance(id: UUID) => returns the instance id a player is in or null
    query getInstance(id: UUID) => returns the data from the instance with the requested id or throws an error
    command tickCombatInstance(id: UUID) => returns updated combat data if enough time has elapsed or returns a timeout object
*/

import { command, getRequestEvent, query } from "$app/server";
import type { ICombatState } from "$lib/types/combat";
import { redirect } from "@sveltejs/kit";
import type { UUID } from "node:crypto";
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
            "message": "Combat has progressed to next tick"
        };
    } else {
        return true;
    }
});