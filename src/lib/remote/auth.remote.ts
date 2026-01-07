import { goto, refreshAll } from "$app/navigation";
import { form, getRequestEvent, query } from "$app/server";
import { supabase } from "$lib/auth/supabaseClient";
import { redirect } from "@sveltejs/kit";
import * as z from "zod";

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
        return { success: false, msg: error.message }
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


    return { success: true }
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

    console.log("logging out");

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.warn(error);
        return { success: false, msg: error.message }
    }

    cookies.delete('supabase.session', { path: '/' });

    redirect(308, "/");
    return { success: true }
});

export const signup = form(signupAuthSchema, async ({ email, password, passwordRepeat }) => {
    if (password != passwordRepeat) return { success: false }

    console.log("signing up");

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