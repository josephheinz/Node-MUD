import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { webSocketServer } from 'sveltekit-ws/vite';
import { getWebSocketManager, type WSConnection } from 'sveltekit-ws';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { wsManager } from './src/lib/websocketManager';

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

async function authMessage(
	connection: WSConnection,
	message: Partial<WSMessage<{ session: string }>> & { data: { session: string } },
	mode: string
) {
	const env = loadEnv(mode, process.cwd(), '');

	try {
		// Parse and verify the session (same as verifyClient)
		const session = JSON.parse(message.data.session);

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

		if (!user) {
			connection.ws.close();
			return;
		}

		// Send success back
		const manager = getWebSocketManager();
		manager.send(connection.id, { type: 'auth-success', data: { userId: user.id } });

		// Now you have verified userId
		wsManager.addConnection(connection.id, { userId: user.id }, supabase);
	} catch (e) {
		console.error('Auth failed:', e);
		connection.ws.close();
	}
}

function handleChatMessage(msg: string) {
	const manager = getWebSocketManager();
	const message = JSON.parse(msg) as { author: string; content: string; timestamp: number };

	manager.broadcast({
		type: 'chat-message',
		data: {
			author: {
				username: wsManager.getUser(message.author)?.username,
				badges: wsManager.getBadges(message.author) ?? []
			},
			content: message.content,
			timestamp: message.timestamp
		},
		timestamp: Date.now()
	});
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	console.log('Loaded env:', env.VITE_SUPABASE_URL); // Debug log
	return {
		plugins: [
			webSocketServer({
				path: '/ws',
				verifyClient: async ({ req }) => {
					const cookies = parseCookies(req.headers.cookie);
					const sessionString = cookies['supabase.session'];

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
					onMessage: async (connection, message) => {
						const user = wsManager.getUserByConnection(connection.id);

						if (!user && message.type !== 'auth') {
							connection.ws.close();
							return;
						}

						switch (message.type) {
							case 'auth':
								console.log('authenticating');
								await authMessage(connection, message as any, mode);
								break;
							case 'chat-message':
								handleChatMessage(JSON.stringify(message.data));
								break;
						}

						//console.log('Received', message, 'from', connection.id);
					},
					onDisconnect: (connection) => {
						wsManager.removeConnection(connection.id);
						console.log('Client disconnected:', connection.id);
					}
				}
			}),
			tailwindcss(),
			sveltekit()
		]
	};
});
