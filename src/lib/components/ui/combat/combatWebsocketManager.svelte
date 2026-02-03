<script lang="ts">
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { onMount } from 'svelte';
	import Spinner from '../spinner/spinner.svelte';

	let { instance = $bindable() }: { instance: string } = $props();

	let ws: WebSocket | null = null;
	let connected: boolean = $state(false);

	onMount(() => {
		if (!ws && websocketStore.connected) {
			ws = websocketStore.ws;
			connected = true;
		}

		ws!.send(
			JSON.stringify({
				type: 'combat-join-instance'
			})
		);

		ws!.addEventListener('message', (event) => {
			const message: WSMessage<any> = JSON.parse(event.data);

			switch (message.type) {
				case 'combat-join-instance':
					instance = message.data.instanceId;
					break;
			}
		});
	});
</script>

{#if connected === false}
	<div class="flex items-center justify-center gap-2">
		<Spinner />
		<span>Loading...</span>
	</div>
{/if}
