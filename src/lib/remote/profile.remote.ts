import { form, getRequestEvent, prerender, query } from "$app/server"
import type { Profile } from "$lib/store.svelte";
import type { Equipment, Inventory } from "$lib/types/item";
import * as z from "zod"
import { getInventory, getInventoryById } from "./inventory.remote";
import { getEquipment, getEquipmentById } from "./equipment.remote";
import type { Skill, SkillKey } from "$lib/types/skills";
import { getSkills, getSkillsById } from "./skills.remote";
import { redirect } from "@sveltejs/kit";

export interface IApiSettings {
    profile_id: string;
    inventory_api: boolean;
    equipment_api: boolean;
}

export const getProfilePage = query(z.string(), async (username) => {
    const { locals: { supabase, user } } = getRequestEvent();

    let apiSettings: IApiSettings | undefined;
    let inventory: Inventory | undefined;
    let equipment: Equipment | undefined;
    let profile: Profile | undefined;
    let skills: Record<SkillKey, Skill> | undefined;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error(`${username}'s profile not found in the database`)

    profile = data;

    const { data: apiData, error: apiError } = await supabase
        .from("profile_settings")
        .select("*")
        .eq("profile_id", profile!.id)
        .single();

    if (apiError) throw new Error(apiError.message);
    if (!apiData) throw new Error(`${username}'s profile settings not found in the database`)

    apiSettings = apiData;

    if (user?.id === profile!.id) {
        inventory = await getInventory();
        equipment = await getEquipment();
        skills = await getSkills();
        return { profile, apiSettings, inventory, equipment, isUser: true, skills }
    }

    if (apiSettings?.equipment_api) {
        equipment = await getEquipmentById(profile!.id);
    }

    if (apiSettings?.inventory_api) {
        inventory = await getInventoryById(profile!.id);
    }

    skills = await getSkillsById(profile!.id)

    return { profile, apiSettings, inventory, equipment, skills, isUser: false }
})

export const updateProfileSettings = form(z.object({
    display_name: z.string(),
    profile_picture: z.url(),
    banner_picture: z.url()
}), async (settings) => {
    const { locals: { supabase, user } } = getRequestEvent();

    if (!user) {
        redirect(307, "/");
    }

    console.log(settings)

    const { data, error } = await supabase
        .from("profiles")
        .update({ profile_picture: settings.profile_picture, banner_picture: settings.banner_picture, display_name: settings.display_name })
        .eq("id", user.id)
        .select("username");

    if (error) throw new Error(error.message);

    await getProfilePage(data[0].username).refresh(); 
});