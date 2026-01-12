import { supabase } from '$lib/auth/supabaseClient.old.js';
import type { User } from '@supabase/supabase-js';

export interface IApiSettings {
	profile_id: string;
	inventory_api: boolean;
	equipment_api: boolean;
}

export const prerender = true;

export async function load({ params, locals }) {
	const { username } = params;

	const user: User | null = locals.user;

	let apiSettings: IApiSettings | undefined;

	const { data, error } = await supabase.from('profiles').select('*').eq('username', username);

	if (!data) return { profile: undefined, api_settings: undefined };

	const { data: apiData, error: apiError } = await supabase
		.from('profile_settings')
		.select('*')
		.eq('profile_id', data[0]?.id);

	if (apiData) apiSettings = apiData[0] as IApiSettings;

	if (data) return { profile: data[0], api_settings: apiSettings };

	return { profile: undefined, api_settings: apiSettings, user };
}
