import type { UUID } from "node:crypto";
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.PRIVATE_SUPABASE_SECRET_KEY!;

export const SECRET_supabase = createClient(supabaseUrl, supabaseSecretKey)

export async function playerInCombat(playerId: UUID): Promise<boolean> {
    const { data, error } = await SECRET_supabase
        .from("combat_instances_players")
        .select("*")
        .eq("player_id", playerId)
        .single();

    if (data) return true;

    return false;
}

export async function createCombatInstance(): Promise<UUID> {
    const { data, error } = await SECRET_supabase
        .from("combat_instances")
        .insert({})
        .select("id")
        .single();

    if (data) return data.id as UUID;

    if (error) throw new Error(error.message);

    throw new Error("Something went wrong");
}

export async function getPlayerCombatInstance(playerId: UUID): Promise<UUID | undefined> {
    const inCombat = await playerInCombat(playerId);

    if (inCombat) {
        const { data, error } = await SECRET_supabase
            .from("combat_instances_players")
            .select("room_id")
            .eq("player_id", playerId)
            .single();

        if (data) return data.room_id as UUID;

        if (error) throw new Error(error.message);
    } else {
        return undefined;
    }
}

export async function getOrCreateCombatInstance(playerId: UUID): Promise<UUID> {
    const instance: UUID | undefined = await getPlayerCombatInstance(playerId);

    if (instance) return instance;

    const createdInstance: UUID = await createCombatInstance();
    const { error } = await SECRET_supabase
        .from("combat_instances_players")
        .upsert({ player_id: playerId, room_id: createdInstance })
        .eq("player_id", playerId);

    if (error) throw new Error(error.message);

    return createdInstance;
}