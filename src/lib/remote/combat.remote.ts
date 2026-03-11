import { command, getRequestEvent, query } from "$app/server";
import { SECRET_supabase } from "$lib/auth/supabaseClient";
import { combatTick } from "$lib/server/combat";
import { getCombatAction } from "$lib/types/action";
import { combatEnemyToCombatEntity, type ICombatEndState, type ICombatState } from "$lib/types/combat";
import type { EnemyStats } from "$lib/types/enemy";
import { type DBInventory, Inventory } from "$lib/types/item";
import { loadDbItem, tryStackItemInInventory } from "$lib/utils/item";
import { redirect } from "@sveltejs/kit";
import type { UUID } from "node:crypto";
import { invert } from "radashi";
import * as z from "zod";
import { getSkillsById } from "./skills.remote";
import type { SkillKey } from "$lib/types/skills";

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

export const exitCombatInstance = command(z.uuidv4(), async (id) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        redirect(307, "/");
    }

    const { data, error: getError } = await SECRET_supabase
        .from("combat_instances")
        .select("combat_data")
        .eq("id", id)
        .single();

    if (!data) throw new Error("combat instance has no data");

    const combatState: ICombatState = data.combat_data;
    const ended: ICombatEndState | undefined = combatState.ended;

    if (ended) {
        const drops = ended.drops;
        const xp = ended.xp;

        const { data: playerData, error: playerError } = await SECRET_supabase
            .from("combat_instances_players")
            .select("player_id")
            .eq("room_id", id);

        if (playerError) throw new Error(playerError.message);
        if (!playerData) throw new Error("issue with player data in the instance room");

        const playerIds: UUID[] = playerData.map(d => d.player_id as UUID);

        for (let i = 0; i < playerIds.length; i++) {
            const playerId: UUID = playerIds[i]

            const { data: playerInv, error: invError } = await SECRET_supabase
                .from("inventories")
                .select("inventory_data")
                .eq("player_id", playerId)
                .single();

            if (invError) throw new Error(invError.message);
            if (playerInv === null) throw new Error("player inventory null");

            const loadedInv: Inventory = Inventory.load(playerInv.inventory_data as DBInventory);

            let updInv: Inventory = loadedInv;
            drops?.forEach((drop) => {
                updInv = tryStackItemInInventory(loadDbItem(drop), updInv);
            });

            const { error: invUpdErr } = await SECRET_supabase
                .from("inventories")
                .update({ inventory_data: updInv.serialize() })
                .eq("player_id", playerId)
            if (invUpdErr) throw new Error(invUpdErr.message);

            let skills = await getSkillsById(playerId);

            if (xp) {
                Object.entries(xp).forEach(([key, amount]) => {
                    skills[key as SkillKey].xp += amount;
                });

                const { error: updSkillsErr } = await SECRET_supabase
                    .from("skills")
                    .update({ skills_data: skills })
                    .eq("player_id", playerId);

                if (updSkillsErr) throw new Error(updSkillsErr.message);
            }
        }
    }

    const { error } = await SECRET_supabase
        .from("combat_instances_players")
        .delete()
        .eq("room_id", id);

    if (error) throw new Error(error.message)

    const { error: roomError } = await SECRET_supabase
        .from("combat_instances")
        .delete()
        .eq("id", id);

    if (roomError) throw new Error(roomError.message)
});

export const enterCombatInstance = command(z.string(), async (id) => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        redirect(307, "/");
    }

    const action = getCombatAction(id);

    if (!action) throw new Error(`${id} not real combat action`);

    const { data: statsData, error: statsErr } = await SECRET_supabase
        .from("inventories")
        .select("stats_data")
        .eq("player_id", locals.user.id)
        .single();

    if (!statsData || statsErr) throw new Error("Player doesnt have stats data");

    const playerStats: EnemyStats = { ...statsData.stats_data, maxHealth: statsData.stats_data["health"] };

    const combat_data: ICombatState = {
        tick: 0,
        previousTick: Date.now(),
        players: [{
            id: locals.user.id as UUID,
            enemyId: "",
            stats: playerStats
        }],
        entities: [...action.enemies].map(combatEnemyToCombatEntity),
        ticking: true
    };

    const { data: idData, error: createError } = await SECRET_supabase
        .from("combat_instances")
        .insert({ combat_data })
        .select("id");

    if (createError) throw new Error(createError.message);

    const instanceId: UUID = idData[0].id as UUID;

    const { error: roomError } = await SECRET_supabase
        .from("combat_instances_players")
        .insert({ player_id: locals.user.id, room_id: instanceId });

    if (roomError) throw new Error(roomError.message);

    return true;
});