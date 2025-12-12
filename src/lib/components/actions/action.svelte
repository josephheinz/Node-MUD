<script lang="ts">
	import { getAction, type Action } from '$lib/types/action';

	let {
		action,
		onclick: onclickfunc,
		usuable
	}: { action: string; onclick: (action: string) => void; usuable: boolean } = $props();

	let loadedAction: Action | null = $derived(getAction(action));
</script>

{#if loadedAction}
	<button
		class={`flex aspect-1/1 cursor-pointer flex-col items-center justify-start gap-2 rounded-md border-2 border-zinc-700 bg-zinc-800 p-4
		${usuable === false ? 'opacity-50' : ''}
		`}
		onclick={() => {
			onclickfunc(action);
		}}
	>
		<div
			class="aspect-1/1 w-1/2 bg-current"
			style="
		-webkit-mask: url({loadedAction.icon.image}) no-repeat center;
		mask: url({loadedAction.icon.image}) no-repeat center;
		-webkit-mask-size: contain;
		mask-size: contain;
		background: {loadedAction.icon.color};
	"
		></div>
		<h1 class="w-full shrink text-center text-lg font-bold">{loadedAction.name}</h1>
	</button>
{/if}
