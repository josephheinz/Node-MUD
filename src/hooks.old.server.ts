// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { initSocketServer } from '$lib/server/socket';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// @ts-expect-error - server is available in dev mode
const server = globalThis.__sveltekit_server__;

if (server) {
	initSocketServer(server);
}

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

	// READ YOUR COOKIE
	const raw = event.cookies.get('supabase.session');

	if (raw) {
		try {
			const session = JSON.parse(raw);

			// session should contain: { access_token, refresh_token, expires_at, ... }
			await supabase.auth.setSession(session);
		} catch (e) {
			console.error('Invalid supabase.session cookie');
		}
	}

	event.locals.supabase = supabase;

	const {
		data: { user }
	} = await supabase.auth.getUser();

	event.locals.user = user;

	return resolve(event);
};
