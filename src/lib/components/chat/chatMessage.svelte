<script lang="ts">
	import ItemHover from './itemHover.svelte';
	import type { ChatMessage } from '$lib/types';
	import { type Item } from '$lib/items';
	import { extractItemsFromMessage } from '$lib/utils';

	// Props
	let { msg }: { msg: ChatMessage } = $props();

	// Reactive derived parts
	let parts: (string | Item)[] = $derived.by(() => extractItemsFromMessage(msg.content));
</script>

<li class="inline-flex items-center justify-start gap-1 text-sm">
	<span class="text-zinc-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
	<b>@{msg.author}:</b>
	{#each parts as part}
		{#if typeof part === 'string'}
			<span>{part}</span>
		{:else}
			<ItemHover item={part} mode={'icon'} />
		{/if}
	{/each}
</li>
