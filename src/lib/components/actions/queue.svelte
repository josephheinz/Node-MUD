<script lang="ts">
	import type { DBQueueAction } from '$lib/types/action';
	import { get } from 'svelte/store';
	import ProgressBar from './progressBar.svelte';
	import * as store from '$lib/store';

	let { queue: initialQueue, running }: { queue: DBQueueAction[]; running: boolean } = $props();

	let queue: DBQueueAction[] = $state(initialQueue);

	let copyStart: number = get(store.queueStart) ?? 0;
	let copyEnd: number = get(store.queueEnd) ?? 0;
	let elapsedPercent: number = $state(0);

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
			let timeDiffMilliseconds: number = now - (copyStart ? copyStart : now);

			let actionTimeMilliseconds: number = queue[0].action.time * 1000; // add 100 milliseconds margin of error

			elapsedPercent = Math.min((timeDiffMilliseconds / actionTimeMilliseconds) * 100, 100);
			// console.log(elapsedPercent); // Keep this for debugging if needed

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
			const response = await fetch(`/api/action/${get(store.user)?.id}`);

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.queue) {
				store.actionQueue.set(data.queue);
			}
			if (data.inventory) {
				store.inventory.set(data.inventory);
			}

			const shouldContinue = data.queue && data.queue.length > 0;

			elapsedPercent = 0;

			if (shouldContinue) {
				isUpdating = false;

				store.queueStart.set(Date.now());
				startTimer();
			} else {
				store.queueStart.set(null);
				store.queueEnd.set(null);
				store.queueActive.set(false);
				stopTimer();
			}
		} catch (error) {
			console.error('Queue update failed:', error);
			isUpdating = false;
			elapsedPercent = 0;
			stopTimer();
		}
	}

	store.queueEnd.subscribe((value) => (copyEnd = value ?? 0));
	store.queueStart.subscribe((value) => (copyStart = value ?? 0));
	store.actionQueue.subscribe((value) => (queue = value));

	store.queueActive.subscribe((value) => {
		if (value === true) {
			if (timer === undefined && get(store.actionQueue).length > 0) {
				startTimer();
			}
		} else {
			stopTimer();
		}
	});
</script>

<div class="size-fit rounded-md border-2 border-zinc-700 bg-zinc-800 p-2 select-none">
	<h1 class="inline-block text-lg font-semibold">Action Queue</h1>
	<br />
	<div class="w-48">
		<ProgressBar value={elapsedPercent} max={100} />
	</div>
	{#if queue.length <= 0}
		<span class="m-4 text-zinc-400">No actions in queue </span>
	{:else}
		<div class="w-full">
			<h2 class="text-md font-medium">
				{queue[0].action.name} x{queue[0].amount}
				{#if queue.length > 1}
					<span class="text-sm text-zinc-400">
						and {queue.length - 1} more
					</span>
				{/if}
			</h2>
		</div>
	{/if}
</div>
