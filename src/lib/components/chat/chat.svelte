<script lang="ts">
	import { socketStore } from '$lib/stores/socket.svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { ChatMessage } from '$lib/types';
	import type { User } from '@supabase/supabase-js';
	import ChatMessageComp from './chatMessage.svelte';

	let { user }: { user: User } = $props();

	let message = $state('');
	let messages = $state<ChatMessage[]>([]);
	let room = $state('general');
	let currentRoom = $state<string | null>(null);
	let username: string = $derived(user?.user_metadata?.full_name ?? '');

	function sendMessage() {
		if (!message.trim()) return;
		console.log(username);
		socketStore.emit('message', {
			author: username,
			content: message,
			timestamp: Date.now()
		});

		message = '';
	}

	function joinRoom() {
		if (currentRoom) {
			socketStore.emit('leave-room', currentRoom);
		}
		socketStore.emit('join-room', room);
		currentRoom = room;
	}

	function sendRoomMessage() {
		if (!message.trim() || !currentRoom) return;

		socketStore.emit('room-message', {
			room: currentRoom,
			message: {
				author: username,
				content: message,
				timestamp: Date.now()
			}
		});

		message = '';
	}

	onMount(() => {
		// Listen for messages
		socketStore.on('message', (data) => {
			messages.push(data);
			messages = messages; // Trigger reactivity
		});

		socketStore.on('room-message', (data) => {
			messages.push({
				author: data.from,
				content: `[Room] ${data.message.text}`,
				timestamp: data.message.timestamp
			});
			messages = messages;
		});

		socketStore.on('user-joined', (data) => {
			console.log('User joined:', data);
		});
	});

	onDestroy(() => {
		// Clean up listeners
		socketStore.off('message');
		socketStore.off('room-message');
		socketStore.off('user-joined');
	});
</script>

<div
	class="absolute bottom-0 flex h-1/4 w-full flex-col items-center justify-stretch border-2 border-zinc-700 bg-zinc-800 p-2"
>
	<!-- Message history -->
	<ul class="wrap-pretty w-full grow overflow-y-scroll gap-1 flex flex-col">
		{#each messages as msg}
			<ChatMessageComp {msg} />
		{/each}
	</ul>
	<!-- Chat bar -->
	<div class="flex h-min w-full items-center justify-around gap-2">
		<input
			type="text"
			class="h-min grow border-2 border-zinc-500 bg-zinc-600 p-2 text-xs transition-all outline-none hover:border-zinc-400 focus:border-zinc-400 focus:ring-0 focus:outline-hidden"
			bind:value={message}
			onkeydown={(e) => e.key === 'Enter' && sendMessage()}
			placeholder="Type a message..."
		/>
		<button
			class="cursor-pointer rounded-md border-2 border-indigo-700 bg-indigo-500 px-4 py-2 text-xs"
			onclick={sendMessage}>Send</button
		>
	</div>
</div>
