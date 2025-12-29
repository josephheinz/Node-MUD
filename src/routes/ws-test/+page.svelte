<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';

	let ws: WebSocket | null = null;
	let connected = $state(false);
	let inputMessage = $state('');
	let messages = $state<string[]>([]);

	onMount(() => {
		if (!browser) return;

		ws = new WebSocket(`ws://${window.location.host}/ws`);

		ws.onopen = () => {
			connected = true;
			console.log('Connected!');
		};

		ws.onclose = () => {
			connected = false;
			console.log('Disconnected');
		};

		ws.onmessage = (event) => {
			console.log('Message received:', event.data);
			messages = [...messages, event.data];
		};
	});

	onDestroy(() => {
		if (ws) ws.close();
	});

	function sendMessage() {
		if (ws && connected && inputMessage.trim()) {
			const message: WSMessage = {
				userId: 'test-user',
				roomId: 'test-room',
				data: {
					content: inputMessage,
					type: 'text',
					message_type: 'text',
					status: 'success',
					timestamp: new Date(Date.now())
				},
				type: 'message'
			};

			ws.send(JSON.stringify(message));
			inputMessage = '';
		}
	}
</script>

<div>
	<h1>Websocket test</h1>
	<p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>

	<div>
		<input bind:value={inputMessage} placeholder="Type a message..." />
		<button onclick={sendMessage} disabled={!connected}>Send</button>
	</div>

	<div>
		<h3>Messages:</h3>
		{#each messages as message}
			<p>{message}</p>
		{/each}
	</div>
</div>
