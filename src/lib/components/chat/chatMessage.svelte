<script lang="ts">
	import ItemHover from './itemHover.svelte';
	import type { ChatMessage } from '$lib/types.svelte';
	import { type Item } from '$lib/types/item';
	import {
		AccoladeReferences,
		extractItemsFromMessage,
		getAccoladesForUser
	} from '$lib/utils/chat';
	import Fa from 'svelte-fa';

	let { msg }: { msg: ChatMessage } = $props();

	let parts: (string | Item)[] = $derived.by(() => extractItemsFromMessage(msg.content));
	let accolades: Array<keyof typeof AccoladeReferences> = $state([]);

	async function loadAccolades() {
		accolades = await getAccoladesForUser(msg.author);
	}

	$effect(() => {
		loadAccolades();
	});
</script>

<li class="inline-flex items-center justify-start gap-1 text-sm">
	<span class="text-zinc-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
	<span class="flex gap-1 text-xs">
		{#each accolades as acc}
			<Fa icon={AccoladeReferences[acc].icon} color={AccoladeReferences[acc].color} />
		{/each}
	</span>
	<a class="font-semibold" href="/profile/{msg.author}">@{msg.author}:</a>
	{#each parts as part}
		{#if typeof part === 'string'}
			<span>{part}</span>
		{:else}
			<ItemHover item={part} />
		{/if}
	{/each}
</li>
