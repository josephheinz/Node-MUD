<script lang="ts">
	import { gameState } from '$lib/store.svelte';
	import type { Action, DBQueueAction } from '$lib/types/action';
	import Progress from '../progress/progress.svelte';

	const {
		queue,
		started,
		loadedQueue
	}: { queue: DBQueueAction[]; started: Date; loadedQueue: Map<number, Action> } = $props();

	let elapsedPercent: number = $state(0);
	let running: boolean = $state(false);
	let timer: number | NodeJS.Timeout | undefined = undefined;
	let isUpdating = false;

	function stopTimer() {
		if (timer) {
			clearInterval(timer);
			timer = undefined;
		}
		running = false;
	}

	function startTimer() {
		if (timer || isUpdating) return;
		if (queue.length <= 0) {
			stopTimer();
			return;
		}
		running = true;
		timer = setInterval(async () => {
			if (queue.length <= 0 || !running || isUpdating) {
				stopTimer();
				return;
			}

			let now: number = Date.now();

			// Ensure started is a valid Date object
			let startTime: number;
			if (started instanceof Date) {
				startTime = started.getTime();
			} else if (typeof started === 'string' || typeof started === 'number') {
				startTime = new Date(started).getTime();
			} else {
				console.error('Invalid started date:', started);
				stopTimer();
				return;
			}

			let timeDiffMilliseconds: number = now - startTime;
			let actionTimeMilliseconds: number =
				(loadedQueue.entries().next().value?.[1].time ?? 0) * 1000;

			elapsedPercent = Math.min((timeDiffMilliseconds / actionTimeMilliseconds) * 100, 100);

			if (elapsedPercent >= 100) {
				stopTimer();
				isUpdating = true;
				await new Promise((resolve) => setTimeout(resolve, 100));
				await tryUpdateQueue();
				isUpdating = false;
			}
		}, 50);
	}

	async function tryUpdateQueue() {
		try {
			// Store the current queue length to compare against
			const currentQueueLength = queue.length;
			let data;
			let attempts = 0;
			const maxAttempts = 100;

			do {
				console.log('hitting api');
				const response = await fetch(`/api/action/${gameState.user?.id}`);
				if (!response.ok) {
					throw new Error(`HTTP Error: ${response.statusText}`);
				}
				data = await response.json();

				console.log(data);
				// Check if the queue has changed (length or content)
				// If the queue length decreased, the action completed
				if (data.queue && data.queue.length < currentQueueLength) {
					break;
				}

				attempts++;
				if (attempts >= maxAttempts) {
					console.warn('Max polling attempts reached');
					break;
				}

				await new Promise((resolve) => setTimeout(resolve, 1000));
			} while (data.queue && data.queue.length >= currentQueueLength);

			// TODO: Update stores with final data
			if (data.queue) {
				gameState.queue.queue = data.queue;
			}
			if (data.inventory) {
				gameState.inventory = data.inventory;
			}

			const shouldContinue = data.queue && data.queue.length > 0;
			elapsedPercent = 0;

			if (shouldContinue) {
				isUpdating = false;
				gameState.queue.started = new Date(Date.now());
				startTimer();
			} else {
				gameState.queue.started = new Date(0);
				stopTimer();
			}
		} catch (error) {
			console.error('Queue update failed:', error);
			isUpdating = false;
			elapsedPercent = 0;
			stopTimer();
		}
	}

	$effect(() => {
		if (queue.length > 0 && !running && timer === undefined) {
			startTimer();
		}
	});
</script>

<Progress max={100} value={elapsedPercent} />
