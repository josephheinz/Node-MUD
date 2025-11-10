<script lang="ts">
	import type { DBQueueAction } from '$lib/types/action';

	const { queue }: { queue: DBQueueAction[] } = $props();
</script>

<div class="rounded-md border-2 border-zinc-700 bg-zinc-800 p-2 select-none">
	<h1 class="text-lg font-semibold">Action Queue</h1>
	{#if queue.length <= 0}
		<span class="m-4 text-zinc-400">No actions in queue</span>
	{:else}
		<div class="w-full">
			<h2 class="text-md font-medium">{queue[0].action.name} x{queue[0].amount}</h2>
			{#if queue.length > 1}
				<h3 class="text-sm text-zinc-400">
					{queue[0].action.name} x{queue[0].amount} and {queue.length - 2} more
				</h3>
			{/if}
		</div>
	{/if}
</div>
