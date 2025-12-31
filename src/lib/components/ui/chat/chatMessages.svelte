<script lang="ts">
	import { ScrollState } from 'runed';
	import type { ChatMessage } from './chat.svelte';
	import Fa from 'svelte-fa';
	import { BadgeReferences } from '$lib/utils/chat';

	let { messages }: { messages: ChatMessage[] } = $props();

	let el = $state<HTMLElement>();

	const scroll = new ScrollState({
		element: () => el
	});

	let atBottom = $derived(scroll.arrived.bottom);
</script>

<ul class="flex grow flex-col-reverse overflow-y-scroll px-2 gap-2" bind:this={el}>
	{#each messages as message}
		<li class="w-full text-xs text-muted-foreground select-none">
			<!-- HEADER ROW -->
			<div class="flex shrink-0 items-center gap-1">
				<span>
					[{Intl.DateTimeFormat(undefined, {
						hour: '2-digit',
						minute: '2-digit',
						hour12: false
					}).format(new Date(message.timestamp))}]
				</span>

				<span class="flex shrink-0 gap-0.5">
					{#each message.author.badges as badge}
						<Fa icon={BadgeReferences[badge].icon} color={BadgeReferences[badge].color} />
					{/each}
				</span>

				<a href="#" class="shrink-0 hover:text-foreground hover:underline">
					@{message.author.username}:
				</a>
			</div>

			<!-- MESSAGE BODY -->
			<div class="pl-[3.1rem] break-words whitespace-pre-wrap select-all">
				{message.content}
			</div>
		</li>
	{/each}
</ul>
