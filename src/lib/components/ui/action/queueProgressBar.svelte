<script lang="ts">
	import { getQueue } from '$lib/remote/actions.remote';
	import type { Action, DBQueueAction } from '$lib/types/action';
	import Progress from '../progress/progress.svelte';

	const {
		queue,
		started,
		loadedQueue
	}: { queue: DBQueueAction[]; started: Date; loadedQueue: Map<number, Action> } = $props();

</script>

<Progress max={100} value={0} />
