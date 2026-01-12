<script lang="ts">
	import { getQueue, updateQueue } from '$lib/remote/actions.remote';
	import { getInventory } from '$lib/remote/inventory.remote';
	import type { DBQueueAction } from '$lib/types/action';
	import { loadDbQueue } from '$lib/utils/action';
	import { cloneDeep, isEqual } from 'radashi';
	import Progress from '../progress/progress.svelte';
	import { onMount } from 'svelte';

	const {
		queueData
	}: {
		queueData: {
			queue: DBQueueAction[];
			started: Date | null;
		};
	} = $props();

	onMount(() => console.log(queueData));

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

			console.log(timeDiffMilliseconds);

			let actionTimeMilliseconds: number =
				(loadedQueue.entries().next().value?.[1].time ?? 0) * 1000;

			elapsedPercent = Math.min((timeDiffMilliseconds / actionTimeMilliseconds) * 100, 100);

			if (elapsedPercent >= 100) {
				stopTimer();

				isUpdating = true;

				/* 				await new Promise((resolve) => setTimeout(resolve, 100));
				 */
				await tryUpdateQueue();

				isUpdating = false;
			}
		}, 50);
	}

	async function tryUpdateQueue() {
		try {
			await updateQueue();
			let updatedQueue = await getQueue();
			console.log(updatedQueue.queue, queueData.queue);
			const originalQueue = cloneDeep(queueData.queue);

			if (!isEqual(updatedQueue.queue, originalQueue)) {
				await getQueue().refresh();
				await getInventory().refresh();
				elapsedPercent = 0;
				return;
			}

			do {
				await new Promise((resolve) => setTimeout(resolve, 5000));
				await updateQueue();
				updatedQueue = await getQueue();
				console.log(await getQueue());
				console.log(originalQueue, updatedQueue);
			} while (isEqual<{ id: string; amount: number }[]>(updatedQueue.queue, originalQueue));

			if (!isEqual(updatedQueue.queue, originalQueue)) {
				await getQueue().refresh();
				await getInventory().refresh();
				elapsedPercent = 0;
			}
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
