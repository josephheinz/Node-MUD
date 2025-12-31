<script lang="ts">
	import { gameState } from '$lib/store.svelte';
	import { formatNumber } from '$lib/utils/general';

	let connections: number = $state(gameState.playerCount);

	$inspect(gameState);

	$effect(() => {
		console.log(gameState.playerCount);
		connections = gameState.playerCount;
	});
</script>

<div class="flex items-center justify-center gap-2">
	<div
		class="ring-inset-green-300 aspect-square size-3 animate-pulse rounded-full bg-green-400 inset-ring-1 ease-in-out"
	></div>
	<span class="text-semibold text-sm">
		Online: {formatNumber(connections)}
	</span>
</div>
