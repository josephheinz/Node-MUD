<script lang="ts">
	import { formatNumber } from '$lib/utils/general';
	import { getContext } from 'svelte';

	const ws = getContext('ws');
	const connections: number = $derived(getContext('ws-connections'));
</script>

<div class="flex items-center justify-center gap-2">
	<div
		class="aspect-square size-3 animate-pulse rounded-full bg-green-400 inset-ring-1 ring-inset-green-300 ease-in-out"
	></div>
	<span class="text-semibold text-sm">
		Online: {formatNumber(connections)}
	</span>
</div>
