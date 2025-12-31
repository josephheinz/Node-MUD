// src/lib/stores/websocket.svelte.ts
class WebSocketStore {
	ws = $state<WebSocket | null>(null);
	connected = $state(false);

	setConnection(socket: WebSocket) {
		this.ws = socket;
	}

	setConnected(status: boolean) {
		this.connected = status;
	}

	send(message: any) {
		if (this.ws && this.connected) {
			this.ws.send(JSON.stringify(message));
		}
	}
}

export const websocketStore = new WebSocketStore();
