<script lang="ts">
	import type { Action } from '$lib/types';
	import ProgressBar from './progressBar.svelte';

	let { action }: { action: Action } = $props();
</script>

<div class="aspect-3/4 w-96 rounded-md border-2 border-zinc-700 bg-zinc-800 px-4">
	<header class="my-4 flex w-full items-center justify-center">
		<h1 class="font-bold text-xl">{action.name}</h1>
	</header>
	<ProgressBar value={action.value} max={action.max} />
</div>
