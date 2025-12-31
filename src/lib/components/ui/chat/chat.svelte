<script lang="ts" context="module">
	import Input from '../input/input.svelte';
	import ChatMessages from './chatMessages.svelte';
	import * as ButtonGroup from '../button-group/index';
	import Button from '../button/button.svelte';
	import Fa from 'svelte-fa';
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

	export type ChatMessage = {
		author: {
			username: string;
			badges: string[];
		};
		content: string;
		timestamp: number;
	};

	let messages: ChatMessage[] = $state([]);
</script>

<div class="flex size-full flex-col items-stretch justify-end-safe bg-background py-2">
	<h3 class="mb-2 px-2 text-lg font-semibold text-foreground">Global Chat</h3>
	<!-- Chat messages go here -->
	<ChatMessages bind:messages />
	<ButtonGroup.Root style="width:calc(100% - calc(var(--spacing) * 4));" class=" m-2 mb-0">
		<Input type="text" placeholder="Type a message..." />
		<Button variant="outline" size="icon"><Fa icon={faArrowRight} /></Button>
	</ButtonGroup.Root>
</div>
