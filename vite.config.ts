import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { webSocketServer } from 'sveltekit-ws/vite';
import { getWebSocketManager } from 'sveltekit-ws';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
	if (!cookieHeader) return {};

	return cookieHeader.split(';').reduce(
		(cookies, cookie) => {
			const [name, ...rest] = cookie.trim().split('=');
			cookies[name] = rest.join('='); // rejoin in case value had '=' in it
			return cookies;
		},
		{} as Record<string, string>
	);
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	console.log('Loaded env:', env.VITE_SUPABASE_URL); // Debug log
	return {
		plugins: [
			webSocketServer({
				path: '/ws',
				verifyClient: async ({ req }) => {
					console.log('Verify attempt, cookies:', req.headers.cookie);

					const cookies = parseCookies(req.headers.cookie);
					const sessionString = cookies['supabase.session'];

					console.log('Session string:', sessionString ? 'found' : 'not found');

					if (!sessionString) return false;

					try {
						const decoded = decodeURIComponent(sessionString);
						const session: Session = JSON.parse(decoded);
						const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
							auth: {
								persistSession: false,
								autoRefreshToken: false,
								detectSessionInUrl: false
							}
						});

						await supabase.auth.setSession(session);
						const {
							data: { user }
						} = await supabase.auth.getUser();

						console.log('User:', user ? user.id : 'none');

						return !!user;
					} catch (e) {
						console.error('Auth verification failed:', e);
						return false;
					}
				},
				handlers: {
					onConnect: (connection) => {
						console.log('Client connected:', connection.id);
					},
					onMessage: (connection, message) => {
						const manager = getWebSocketManager();
						manager.broadcast({
							type: message.type,
							data: message.data
						});

						console.log('Received', message, 'from', connection.id);
					},
					onDisconnect: (connection) => {
						console.log('Client disconnected:', connection.id);
					}
				}
			}),
			tailwindcss(),
			sveltekit()
		]
	};
});
