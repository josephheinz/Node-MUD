<script lang="ts">
	import Fa from 'svelte-fa';
	import { BadgeReferences, type ChatMessage } from '$lib/utils/chat';
	import ItemHover from './itemHover.svelte';
	import { type Item } from '$lib/types/item';

	const { message }: { message: ChatMessage } = $props();
</script>

<div class="mb-3">
	<div class="flex items-baseline gap-2">
		<span class="text-sm font-semibold">{message.author.username}</span>
		<span class="flex items-center justify-evenly gap-1 pr-1">
			{#each message.author.badges as badge}
				<Fa icon={BadgeReferences[badge].icon} color={BadgeReferences[badge].color} size="xs" />
			{/each}
		</span>
		<span class="text-xs text-muted-foreground">
			{new Date(message.timestamp).toLocaleTimeString('en-US', {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit'
			})}
		</span>
	</div>
	{#if typeof message.content === 'string'}
		<span class="text-sm">{message.content}</span>
	{:else}
		<span class="text-sm">
			{#each message.content as entry}
				{#if entry.type === 'text'}
					{entry.content}
				{:else}
					<ItemHover item={entry.content as Item} />
				{/if}
			{/each}
		</span>
	{/if}
</div>
