<script lang="ts">
	import { gameState } from '$lib/store.svelte';
	import { formatNumber } from '$lib/utils/general';
	import numeral from 'numeral';

	let { short }: { short: boolean } = $props();

	let connections: number = $state(gameState.playerCount);

	$effect(() => {
		connections = gameState.playerCount;
	});
</script>

<div class="flex items-center justify-center gap-2">
	<div
		class={`ring-inset-green-300 aspect-square ${!short ? 'size-3' : 'size-2'} animate-pulse rounded-full bg-green-400 inset-ring-1 ease-in-out`}
	></div>
	{@render count(short)}
</div>

{#snippet count(short: boolean)}
	{#if short}
		<span class="text-semibold text-xs">{numeral(connections).format('0,0[.]0a')}</span>
	{:else}
		<span class="text-semibold text-sm">
			Online: {formatNumber(connections)}
		</span>
	{/if}
{/snippet}
