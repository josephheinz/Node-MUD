<script lang="ts">
	import type { DBQueueAction } from '$lib/types/action';

	const { queue }: { queue: DBQueueAction[] } = $props();
</script>

<div class="size-fit rounded-md border-2 border-zinc-700 bg-zinc-800 p-2 select-none">
	<h1 class="inline-block text-lg font-semibold">Action Queue</h1>
	<br />
	{#if queue.length <= 0}
		<span class="m-4 text-zinc-400">No actions in queue</span>
	{:else}
		<div class="w-full">
			<h2 class="text-md font-medium">
				{queue[0].action.name} x{queue[0].amount}

				{#if queue.length > 1}
					<span class="text-sm text-zinc-400">
						and {queue.length - 1} more
					</span>
				{/if}
			</h2>
		</div>
	{/if}
</div>
