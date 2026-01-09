<script lang="ts">
	import { getQueue } from '$lib/remote/actions.remote';
	import { getInventory } from '$lib/remote/inventory.remote';
	import type { Action, DBQueueAction } from '$lib/types/action';
	import type { DBInventory } from '$lib/types/item';
	import { loadDbQueue } from '$lib/utils/action';
	import Progress from '../progress/progress.svelte';

	const {
		queueData
	}: {
		queueData: {
			queue: DBQueueAction[];
			started: Date;
			inventory: DBInventory;
			lastUpdated: number;
		};
	} = $props();

	let loadedQueue = $derived(loadDbQueue(queueData.queue));

	let elapsedPercent: number = $state(0);

	let timer: number | NodeJS.Timeout | undefined;
	let isUpdating = false;
	let running = $state(false);

	function stopTimer() {
		if (timer) {
			clearInterval(timer);
			timer = undefined;
		}
		running = false;
	}

	function startTimer() {
		if (timer || isUpdating) return;

		if (queueData.queue.length <= 0) {
			stopTimer();

			return;
		}

		running = true;

		timer = setInterval(async () => {
			if (queueData.queue.length <= 0 || !running || isUpdating) {
				stopTimer();
				return;
			}

			let now: number = Date.now();

			// Ensure started is a valid Date object
			let startTime: number;

			if (queueData.started instanceof Date) {
				startTime = queueData.started.getTime();
			} else if (typeof queueData.started === 'string' || typeof queueData.started === 'number') {
				startTime = new Date(queueData.started).getTime();
			} else {
				console.error('Invalid started date:', queueData.started);
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
			await getQueue().refresh();
			await getInventory().refresh();
		} catch (e) {
			console.error(e);
		}
	}

	$effect(() => {
		if (queueData.queue.length > 0 && !running && timer === undefined) {
			startTimer();
		}
	});
</script>

<Progress max={100} value={elapsedPercent} />
