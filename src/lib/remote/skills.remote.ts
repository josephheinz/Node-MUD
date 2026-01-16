import { getRequestEvent, query } from "$app/server";
import type { Skill, SkillKey } from "$lib/types/skills";
import { redirect } from "@sveltejs/kit";
import * as z from "zod"

export const getSkills = query(async () => {
    const { locals: { user, supabase } } = getRequestEvent();

    if (!user)
        redirect(307, "/");

    const { data, error } = await supabase
        .from("skills")
        .select("skills_data")
        .eq("player_id", user.id)
        .single();

    if (error) throw new Error(error.message)
    if (!data) throw new Error("Skills data not found on the database")


    const skills: Record<SkillKey, Skill> = JSON.parse(JSON.stringify(data.skills_data));

    return skills;
})

export const getSkillsById = query(z.uuidv4(), async (id) => {
    const { locals: { supabase } } = getRequestEvent();


    const { data, error } = await supabase
        .from("skills")
        .select("skills_data")
        .eq("player_id", id)
        .single();

    if (error) throw new Error(error.message)
    if (!data) throw new Error("Skills data not found on the database")


    const skills: Record<SkillKey, Skill> = JSON.parse(JSON.stringify(data.skills_data));

    return skills;
})