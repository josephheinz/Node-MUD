<script lang="ts">
	import { browser } from '$app/environment';
	import { chatMessages, gameState } from '$lib/store.svelte';
	import type { Session, User } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { extractItemsFromMessage, type ChatMessage, type messagePart } from '$lib/utils/chat';
	import { getSession } from '$lib/remote/auth.remote';

	const { user }: { user: User } = $props();

	let ws: WebSocket | null = null;
	let connected = $state(false);

	function closeConnection() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.close();
		}
	}

	async function authWebsocket(ws: WebSocket) {
		const session = (await getSession()).session;

		ws.send(
			JSON.stringify({
				type: 'auth',
				data: {
					session: JSON.stringify(session) // Send the raw cookie value
				}
			})
		);
	}

	onMount(() => {
		if (!browser || !user) return;

		ws = new WebSocket(`ws://${window.location.host}/ws`);

		websocketStore.setConnection(ws);

		ws.onopen = () => {
			connected = true;
			websocketStore.setConnected(true);
			console.log('Connected!');

			if (ws) void authWebsocket(ws);
		};

		ws.onclose = () => {
			connected = false;
			websocketStore.setConnected(false);
			console.log('Disconnected');
		};

		ws.onmessage = (event) => {
			const message: WSMessage<any> = JSON.parse(event.data);
			switch (message.type) {
				case 'auth-success':
					console.log('Successfully authenticated to the websocket');
					break;

				case 'player-count-update':
					gameState.playerCount = message.data.amount;
					console.log('Player count update:', message.data.amount);
					break;

				case 'chat-message':
					chatMessages.messages.push(message.data as ChatMessage<string>);
					chatMessages.parsed.push({
						author: message.data.author,
						content: extractItemsFromMessage(message.data.content) as Set<messagePart>,
						timestamp: message.data.timestamp
					});
					break;
			}
			console.log('Message received:', event.data);
		};

		if (browser) {
			window.addEventListener('beforeunload', closeConnection);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('beforeunload', closeConnection);
		}
		closeConnection();
	});
</script>
