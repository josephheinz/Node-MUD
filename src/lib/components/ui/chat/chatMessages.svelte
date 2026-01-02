<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Button from '../button/button.svelte';
	import Fa from 'svelte-fa';
	import { faArrowDown, faGhost } from '@fortawesome/free-solid-svg-icons';
	import type { ChatMessage as TChatMessage } from '$lib/utils/chat';
	import ChatMessage from './chatMessage.svelte';
	import * as Empty from '../empty';

	let { messages = $bindable() }: { messages: TChatMessage[] } = $props();

	let chatContainer: HTMLDivElement;
	let shouldAutoScroll = $state(true);

	// Scroll to bottom function
	function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
		if (chatContainer) {
			chatContainer.scrollTo({
				top: chatContainer.scrollHeight,
				behavior
			});
		}
	}

	// Check if user is near bottom
	function checkIfNearBottom() {
		if (!chatContainer) return;

		const { scrollTop, scrollHeight, clientHeight } = chatContainer;
		const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

		// If within 100px of bottom, consider it "at bottom"
		shouldAutoScroll = distanceFromBottom < 100;
	}

	// Handle scroll event
	function handleScroll() {
		checkIfNearBottom();
	}

	// Auto-scroll when new messages arrive (if user is at bottom)
	$effect(() => {
		if (messages.length && shouldAutoScroll) {
			tick().then(() => scrollToBottom('smooth'));
		}
	});

	// Scroll to bottom on mount
	onMount(() => {
		scrollToBottom('auto');
	});
</script>

<div class="relative flex h-9/10 max-h-9/10 flex-col">
	<div
		bind:this={chatContainer}
		onscroll={handleScroll}
		class="max-h-full flex-1 grow overflow-y-auto rounded border px-4 pt-4"
	>
		{#if messages.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Media>
						<Fa icon={faGhost} class="text-4xl" />
					</Empty.Media>
					<Empty.Title>No Chat Messages Yet</Empty.Title>
					<Empty.Description>It's quiet in here...</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{:else}
			{#each messages as message (message.timestamp)}
				<ChatMessage {message} />
			{/each}
		{/if}
	</div>
	{#if !shouldAutoScroll}
		<div class="absolute inset-x-0 bottom-0 flex items-center justify-center p-4">
			<Button
				onclick={() => scrollToBottom('smooth')}
				variant="outline"
				size="icon"
				class="aspect-square cursor-pointer rounded-full"
			>
				<Fa icon={faArrowDown} />
			</Button>
		</div>
	{/if}
</div>
