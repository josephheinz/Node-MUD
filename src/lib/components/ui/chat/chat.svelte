<script lang="ts">
	import Input from '../input/input.svelte';
	import ChatMessages from './chatMessages.svelte';
	import * as ButtonGroup from '../button-group/index';
	import Button from '../button/button.svelte';
	import Fa from 'svelte-fa';
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { sendMessage, type ChatMessage } from '$lib/utils/chat';
	import { chatMessages, gameState, type Profile } from '$lib/store.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { PressedKeys } from 'runed';

	let messages: ChatMessage[] = $state(chatMessages.messages);
	let inputMessage: string = $state('');
	let user: Profile | null = $state(gameState.profile);
	const keys = new PressedKeys();

	function message() {
		if (!user || !websocketStore.ws) return;
		sendMessage(inputMessage, user.id, websocketStore.ws);

		inputMessage = '';
	}

	keys.onKeys('enter', () => {
		message();
	});

	$effect(() => {
		user = gameState.profile;
		messages = chatMessages.messages;
	});
</script>

<div class="flex size-full flex-col items-stretch justify-end-safe bg-background py-2">
	<h3 class="mb-2 px-2 text-lg font-semibold text-foreground">Global Chat</h3>
	<!-- Chat messages go here -->

	<ChatMessages bind:messages />
	<ButtonGroup.Root style="width:calc(100% - calc(var(--spacing) * 4));" class=" m-2 mb-0">
		<Input type="text" placeholder="Type a message..." bind:value={inputMessage} />
		<Button variant="outline" size="icon" onclick={message} disabled={user === null}
			><Fa icon={faArrowRight} /></Button
		>
	</ButtonGroup.Root>
</div>
