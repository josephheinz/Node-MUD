import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// @ts-expect-error - server is available in dev mode
const server = globalThis.__sveltekit_server__;

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		},
		global: {
			fetch: event.fetch
		}
	});

	const raw = event.cookies.get('supabase.session');

	/* if (raw) {
		try {
			const session = JSON.parse(raw);

			await supabase.auth.setSession(session);
		} catch (e) {
			console.error('Invalid supabase.session cookie');
		}
	} */

	event.locals.supabase = supabase;

	const {
		data: { user }
	} = await supabase.auth.getUser();

	event.locals.user = user;

	return resolve(event);
};
