import { goto, refreshAll } from "$app/navigation";
import { form, getRequestEvent, query } from "$app/server";
import { supabase } from "$lib/auth/supabaseClient";
import type { Profile } from "$lib/store.svelte";
import { redirect } from "@sveltejs/kit";
import * as z from "zod";
import type { IApiSettings } from "../../routes/profile/[username]/+layout.server";

const loginAuthSchema = z.object({
    email: z.string(),
    password: z.string()
});

const signupAuthSchema = z.object({
    email: z.string(),
    password: z.string(),
    passwordRepeat: z.string()
})

export const login = form(loginAuthSchema, async ({ email, password }) => {
    const { cookies } = getRequestEvent();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error != null) {
        console.warn(error);
        return { success: false, msg: error.message, redirect: "/" }
    }

    if (data.session) {
        cookies.set('supabase.session', JSON.stringify(data.session), {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: data.session.expires_in
        });
    }

    return { success: true, redirect: "/" }
});

export const getSession = query(async () => {
    const { cookies } = getRequestEvent();

    // Load supabase session
    const sessionCookie = cookies.get('supabase.session');
    if (!sessionCookie) return { user: null, session: null }

    let sessionParsed = JSON.parse(sessionCookie);

    const refresh_token = sessionParsed.refresh_token;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
        throw new Error(error.message)
    }

    const { data: d, error: e } = await supabase
        .from('profiles')
        .update({ last_logged_in: new Date(Date.now()) })
        .eq('id', data.user?.id);

    if (e) {
        console.log(e);
    }

    const { session, user } = data;
    return { session, user }
});

export const logout = form(async () => {
    const { cookies } = getRequestEvent();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.warn(error);
        return { success: false, msg: error.message }
    }

    cookies.delete('supabase.session', { path: '/' });

    redirect(308, "/");
});

export const signup = form(signupAuthSchema, async ({ email, password, passwordRepeat }) => {
    if (password != passwordRepeat) return { success: false }

    const { data: _, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: email.split('@')[0]
            }
        }
    });

    if (error != null) {
        console.warn(error);
        return { success: false, msg: error.message };
    }

    return { success: true };
});

export const getUser = query(async () => {
    const { locals } = getRequestEvent();
    if (!locals.user) {
        redirect(307, "/");
    }
    return locals.user;
});

export const getProfile = query(async () => {
    const { locals } = getRequestEvent();
    if (!locals.profile) {
        redirect(307, "/");
    }
    return locals.profile;
});

export const getProfileOrUndefined = query(async () => {
    const { locals } = getRequestEvent();
    if (!locals.profile) {
        return undefined;
    }
    return locals.profile;
});

export const getProfileById = query(z.uuidv4(), async (id) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (!data || error) {
        return undefined;
    }

    return data as Profile;
});

export const getProfileByUsername = query(z.string(), async (username) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (!data || error) {
        return undefined;
    }

    return data as Profile;
});

export const getProfileAndApiSettingsByUsername = query(z.string(), async (username) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (!data || error) {
        throw new Error("Profile not found")
    }
    const profile: Profile = data;

    const { data: apiData, error: apiError } = await supabase
        .from("profile_settings")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

    if (!apiData || apiError) {
        throw new Error(`Api settings not found ${JSON.stringify(apiData)}`)
    }
    const apiSettings: IApiSettings = apiData;

    return { profile, apiSettings };
});

export const getApiSettings = query(z.uuidv4(), async (id) => {
    const { data, error } = await supabase
        .from("profiles_settings")
        .select("*")
        .eq("profile_id", id)
        .single();

    if (!data || error) {
        return undefined;
    }

    return data as IApiSettings;
});