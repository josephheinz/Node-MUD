<script lang="ts">
	import ItemHover from './itemHover.svelte';
	import type { ChatMessage } from '$lib/types.svelte';
	import { type Item } from '$lib/types/item';
	import { extractItemsFromMessage } from '$lib/utils/chat';

	let { msg }: { msg: ChatMessage } = $props();

	let parts: (string | Item)[] = $derived.by(() => extractItemsFromMessage(msg.content));
</script>

<li class="inline-flex items-center justify-start gap-1 text-sm">
	<span class="text-zinc-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
	<a class="font-semibold" href="/profile/{msg.author}">@{msg.author}:</a>
	{#each parts as part}
		{#if typeof part === 'string'}
			<span>{part}</span>
		{:else}
			<ItemHover item={part} />
		{/if}
	{/each}
</li>
