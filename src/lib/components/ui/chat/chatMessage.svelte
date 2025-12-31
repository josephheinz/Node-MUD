<script lang="ts">
	import Fa from 'svelte-fa';
	import type { ChatMessage } from './chat.svelte';
	import { BadgeReferences } from '$lib/utils/chat';

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
	<p class="text-sm">{message.content}</p>
</div>
