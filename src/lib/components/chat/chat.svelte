<script lang="ts">
	import { socketStore } from '$lib/stores/socket.svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { ChatMessage } from '$lib/types.svelte';
	import type { User } from '@supabase/supabase-js';
	import ChatMessageComp from './chatMessage.svelte';
	import type { Item } from '$lib/types/item';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import { sendMessage } from '$lib/utils/chat';
	import Heading from '../generic/heading.svelte';
	import FlexColContainer from '../generic/flexContainers/flexColContainer.svelte';

	let { user }: { user: User } = $props();

	let itemLinkTable: Record<number, Item> = $state(get(store.chatItemLinkTable));
	store.chatItemLinkTable.subscribe((value) => {
		itemLinkTable = value;
	});

	let message = $state(get(store.chatMessage));

	let messages = $state<ChatMessage[]>([]);
	let room = $state('general');
	let currentRoom = $state<string | null>(null);
	let username: string = $derived(user?.user_metadata?.full_name ?? '');
	let connected = $derived(socketStore.connected);

	$effect(() => {
		const unsub = store.chatMessage.subscribe((v) => (message = v));
		return unsub;
	});

	function onInput(e: Event) {
		store.chatMessage.set((e.target as HTMLInputElement)?.value);
	}

	onMount(() => {
		socketStore.on('message', (data) => {
			messages.push(data);
			messages = messages;
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

<FlexColContainer class="relative bottom-0 -m-4 h-1/4 w-full items-center justify-stretch">
	{#if !connected}
		<div class="flex h-full w-full items-center justify-center">
			<Heading>Connecting to chat...</Heading>
		</div>
	{:else}
		<!-- Message history -->
		<ul class="wrap-pretty flex w-full grow flex-col gap-1 overflow-y-scroll py-2">
			{#each messages.toReversed() as msg}
				<ChatMessageComp {msg} />
			{/each}
		</ul>
		<!-- Chat bar -->
		<div class="flex h-min w-full items-center justify-around gap-2">
			<input
				type="text"
				class="h-min grow border-zinc-600 bg-zinc-700 text-xs"
				bind:value={message}
				oninput={onInput}
				onkeydown={(e) => e.key === 'Enter' && sendMessage(message, username, itemLinkTable)}
				placeholder="Type a message..."
			/>
			<button class="primary text-xs" onclick={() => sendMessage(message, username, itemLinkTable)}
				>Send</button
			>
		</div>
	{/if}
</FlexColContainer>
