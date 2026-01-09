<script lang="ts">
	import Input from '../input/input.svelte';
	import ChatMessages from './chatMessages.svelte';
	import * as ButtonGroup from '../button-group/index';
	import Button from '../button/button.svelte';
	import Fa from 'svelte-fa';
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { sendMessage, type ChatMessage, type messagePart } from '$lib/utils/chat';
	import { chatMessages, currentChatMessage, type Profile } from '$lib/store.svelte';
	import { websocketStore } from '$lib/stores/websocket.svelte';
	import { PressedKeys } from 'runed';
	import { getProfile } from '$lib/remote/auth.remote';
	import Skeleton from '../skeleton/skeleton.svelte';

	let parsedMessages: ChatMessage<Set<messagePart>>[] = $state(chatMessages.parsed);
	let inputMessage: string = $derived(currentChatMessage.value);
	const keys = new PressedKeys();

	async function message() {
		const user: Profile = await getProfile();
		if (!user || !websocketStore.ws) return;
		sendMessage(inputMessage, user.id, websocketStore.ws);

		inputMessage = '';
	}

	keys.onKeys('enter', async () => {
		await message();
	});
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="flex size-full flex-col items-stretch justify-evenly bg-background p-2">
			<Skeleton class="h-8 w-full" />
			<Skeleton class="h-8/10 w-full" />
			<Skeleton class="h-10 w-full" />
		</div>
	{/snippet}
	<div class="flex size-full flex-col items-stretch justify-evenly bg-background py-2">
		<h3 class="mb-2 px-2 text-lg font-semibold text-foreground">Global Chat</h3>
		<ChatMessages bind:messages={parsedMessages} />
		<ButtonGroup.Root style="width:calc(100% - calc(var(--spacing) * 4));" class=" m-2 mb-0">
			<Input type="text" placeholder="Type a message..." bind:value={currentChatMessage.value} />
			<Button
				variant="outline"
				size="icon"
				onclick={message}
				disabled={(await getProfile()) === null}><Fa icon={faArrowRight} /></Button
			>
		</ButtonGroup.Root>
	</div>
</svelte:boundary>
