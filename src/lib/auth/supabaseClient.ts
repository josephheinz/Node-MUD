import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PRIVATE_SUPABASE_SECRET_KEY } from "$env/static/private";

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

const supabaseSecretKey = PRIVATE_SUPABASE_SECRET_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		detectSessionInUrl: true,
		persistSession: true,
		autoRefreshToken: true
	}
});

export const SECRET_supabase = createClient(supabaseUrl, supabaseSecretKey)