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

<li class="text-sm">
	<span class="text-zinc-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
	<b>@{msg.author}</b>:
	{#each parts as part}
		{#if typeof part === 'string'}
			<span>{part}</span>
		{:else}
			<ItemHover item={part} mode={"sprite"} />
		{/if}
	{/each}
</li>
