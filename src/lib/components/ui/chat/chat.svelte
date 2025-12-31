<script lang="ts" context="module">
	import ChatMessages from './chatMessages.svelte';

	export type ChatMessage = {
		author: {
			username: string;
			badges: string[];
		};
		content: string;
		timestamp: number;
	};
</script>

<div class="flex size-full flex-col bg-background py-2">
	<h3 class="mb-2 px-2 text-lg font-semibold text-foreground">Global Chat</h3>
	<div class="flex-1 overflow-y-auto rounded border p-2">
		<!-- Chat messages go here -->
		<ChatMessages
			messages={[
				{
					author: { username: 'josephheinz28', badges: ['owner', 'VIP', 'Beta-Tester'] },
					content: 'test test test test test test test test test test test test ',
					timestamp: 1767146285438
				},
				{
					author: { username: 'josephheinz28', badges: [] },
					content: 'test test test test test test test test test test test test ',
					timestamp: 1767146285438
				}
			]}
		/>
	</div>
	<input type="text" placeholder="Type a message..." class="mt-2 rounded border p-2" />
</div>
