<script lang="ts">
	import { browser } from '$app/environment';
	import { gameState } from '$lib/store.svelte';
	import type { Session, User } from '@supabase/supabase-js';
	import { onDestroy, onMount } from 'svelte';

	const { user }: { user: User } = $props();

	let ws: WebSocket | null = null;
	let connected = $state(false);

	function closeConnection() {
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.close();
		}
	}

	async function authWebsocket(ws: WebSocket) {
		const { session, _ }: { session: Session; _: User } = await fetch('/api/auth/session').then(
			(r) => r.json()
		);

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

		ws.onopen = () => {
			connected = true;
			console.log('Connected!');

			if (ws) void authWebsocket(ws);
		};

		ws.onclose = () => {
			connected = false;
			console.log('Disconnected');
		};

		ws.onmessage = (event) => {
			const message: WSMessage<{ amount: number }> = JSON.parse(event.data);
			if (message.type === 'auth-success') {
				console.log('Successfully authenticated to the websocket');
			}

			if (message.type === 'player-count-update') {
				gameState.playerCount = message.data.amount;
				console.log('Player count update:', message.data.amount);
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
