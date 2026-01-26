import { handler } from './build/handler.js';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { wsManager } from './src/lib/websocketManager.js';
import type { IncomingMessage } from 'http';

dotenv.config();

const app = express();
const server = createServer(app);

interface Connection {
	ws: WebSocket;
	req: IncomingMessage;
}

interface WSMessage {
	type: string;
	data: any;
}

interface AuthMessage extends WSMessage {
	type: 'auth';
	data: {
		session: string;
	};
}

interface ChatMessage extends WSMessage {
	type: 'chat-message';
	data: {
		author: string;
		content: string;
		timestamp: number;
	};
}

// WebSocket connection tracking
const connections = new Map<string, Connection>();

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
	if (!cookieHeader) return {};

	return cookieHeader.split(';').reduce(
		(cookies, cookie) => {
			const [name, ...rest] = cookie.trim().split('=');
			cookies[name] = rest.join('=');
			return cookies;
		},
		{} as Record<string, string>
	);
}

async function verifyClient(req: IncomingMessage): Promise<boolean> {
	const cookies = parseCookies(req.headers.cookie);
	const sessionString = cookies['supabase.session'];

	if (!sessionString) return false;

	try {
		const decoded = decodeURIComponent(sessionString);
		const session = JSON.parse(decoded);
		const supabase = createClient(
			process.env.VITE_SUPABASE_URL!,
			process.env.VITE_SUPABASE_ANON_KEY!,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
					detectSessionInUrl: false
				}
			}
		);

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
}

async function authMessage(
	ws: WebSocket,
	connectionId: string,
	message: AuthMessage
): Promise<void> {
	try {
		const session = JSON.parse(message.data.session);

		const supabase = createClient(
			process.env.VITE_SUPABASE_URL!,
			process.env.VITE_SUPABASE_ANON_KEY!,
			{
				auth: {
					persistSession: false,
					autoRefreshToken: false,
					detectSessionInUrl: false
				}
			}
		);

		await supabase.auth.setSession(session);
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			ws.close();
			return;
		}

		// Send success back
		ws.send(JSON.stringify({ type: 'auth-success', data: {} }));

		// Add verified connection
		wsManager.addConnection(connectionId, { userId: user.id }, supabase);
	} catch (e) {
		console.error('Auth failed:', e);
		ws.close();
	}
}

function handleChatMessage(msg: string): void {
	const message = JSON.parse(msg) as ChatMessage['data'];

	const broadcastData = {
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
	};

	// Broadcast to all connections
	connections.forEach((conn) => {
		if (conn.ws.readyState === WebSocket.OPEN) {
			conn.ws.send(JSON.stringify(broadcastData));
		}
	});
}

// WebSocket server setup
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket, req: IncomingMessage, connectionId: string) => {
	console.log('Client connected:', connectionId);

	connections.set(connectionId, { ws, req });

	ws.on('message', async (data: Buffer) => {
		const user = wsManager.getUserByConnection(connectionId);
		let message: WSMessage;

		try {
			message = JSON.parse(data.toString());
		} catch (e) {
			console.error('Invalid message format:', e);
			return;
		}

		if (!user && message.type !== 'auth') {
			ws.close();
			return;
		}

		switch (message.type) {
			case 'auth':
				console.log('authenticating');
				await authMessage(ws, connectionId, message as AuthMessage);
				break;
			case 'chat-message':
				handleChatMessage(JSON.stringify(message.data));
				break;
		}
	});

	ws.on('close', () => {
		wsManager.removeConnection(connectionId);
		connections.delete(connectionId);
		console.log('Client disconnected:', connectionId);
	});

	ws.on('error', (error: Error) => {
		console.error('WebSocket error:', error);
	});
});

// Handle upgrade requests
server.on('upgrade', async (req: IncomingMessage, socket: any, head: Buffer) => {
	if (req.url === '/ws') {
		const verified = await verifyClient(req);

		if (!verified) {
			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
			socket.destroy();
			return;
		}

		const connectionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
			wss.emit('connection', ws, req, connectionId);
		});
	} else {
		socket.destroy();
	}
});

// SvelteKit handler for all other routes
app.use(handler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`WebSocket server ready at ws://localhost:${PORT}/ws`);
});
