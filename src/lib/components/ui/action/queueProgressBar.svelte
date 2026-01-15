<script lang="ts">
	import { getQueue } from '$lib/remote/actions.remote';
	import numeral from 'numeral';
	import Progress from '../progress/progress.svelte';

	const {
		queueData
	}: {
		queueData: {
			currentActionStartedAt: number | null;
			currentActionDuration: number | null;
			progress: number;
			actionTime: number | null;
		};
	} = $props();

	let displayProgress = $state(0);
	let percentProgress = $state(0);
	let progressInterval: ReturnType<typeof setInterval> | null = null;

	async function startProgressAnimation() {
		if (progressInterval) clearInterval(progressInterval);

		if (!queueData.currentActionStartedAt || !queueData.currentActionDuration) {
			displayProgress = 0;
			return;
		}

		// Set initial progress from server
		displayProgress = queueData.progress * 100;

		// Update progress smoothly every 50ms
		progressInterval = setInterval(async () => {
			if (!queueData.currentActionStartedAt || !queueData.currentActionDuration) {
				if (progressInterval) clearInterval(progressInterval);
				return;
			}

			const now = Date.now();
			const elapsed = now - queueData.currentActionStartedAt;
			const calculatedProgress = Math.min((elapsed / queueData.currentActionDuration) * 100, 100);

			displayProgress = calculatedProgress;
			percentProgress = calculatedProgress / 100;

			// Stop if we've reached 100%
			if (displayProgress >= 100) {
				if (progressInterval) clearInterval(progressInterval);
				await getQueue().refresh();
			}
		}, 50);
	}

	// Restart animation when queue data changes
	$effect(() => {
		Promise.resolve(startProgressAnimation());

		return () => {
			if (progressInterval) clearInterval(progressInterval);
		};
	});
</script>

<div class="flex w-full flex-col items-start justify-start gap-1 text-sm">
	<Progress max={100} value={displayProgress} />
	<span>{numeral(percentProgress * (queueData.actionTime ?? 0)).format('0,0.0')}s</span>
</div>
