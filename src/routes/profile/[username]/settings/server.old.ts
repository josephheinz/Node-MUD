import { error } from '@sveltejs/kit';
import { supabase } from '$lib/auth/supabaseClient.js';

export async function POST({ request, params, locals }) {
	const { username } = params;
	const { settings } = await request.json();

	if (!locals.user) throw error(401, 'Not logged in');

	const { data: profile } = await supabase
		.from('profiles')
		.select('id')
		.eq('username', username)
		.single();

	if (!profile) throw error(404, 'No user found');

	if (profile.id !== locals.user.id) {
		throw error(403, 'Not authorized');
	}

	let updatedSettings: Record<string, string | null> = {};
	if (settings.profile_picture !== undefined || settings.profile_picture.trim() !== '')
		updatedSettings.profile_picture = settings.profile_picture;
	else updatedSettings.profile_picture = null;

	if (settings.display_name !== undefined) updatedSettings.display_name = settings.display_name;

	const { data: updateSettings, error: updateSettingsError } = await supabase
		.from('profiles')
		.update(updatedSettings)
		.eq('id', profile.id)
		.select('*')
		.single();

	if (updateSettingsError) {
		throw new Error(updateSettingsError.message);
	}

	return Response.json({ profile: updateSettings }, { status: 200 });
}
