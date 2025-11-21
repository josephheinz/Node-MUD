<script lang="ts">
	import { getAction, type Action } from '$lib/types/action';

	let { action, onclick: onclickfunc }: { action: string; onclick: (action: string) => void } =
		$props();

	let loadedAction: Action | null = $derived(getAction(action));
</script>

{#if loadedAction}
	<button
		class="flex aspect-1/1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-zinc-700 bg-zinc-800 p-4"
		onclick={() => {
			onclickfunc(action);
		}}
	>
		<h1 class="w-full text-center text-lg font-bold">{loadedAction.name}</h1>
	</button>
{/if}
