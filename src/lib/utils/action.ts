import type { StackableModifier } from '$lib/modifiers/basicModifiers';
import { getAction, type Action, type ChanceItem, type DBQueueAction } from '$lib/types/action';
import type { Inventory, Item } from '$lib/types/item';
import { loadDbItem, tryStackItemInInventory } from './item';

export type ProcessedQueue = {
	outputs: { items: Item[] };
	queue: DBQueueAction[];
};

export const TEN_HOUR_ACTION_LIMIT: number = 10 * 60 * 60 * 1000; // ten hours times 60 minutes times 60 seconds times 1000 milliseconds
/* 
export function checkQueueCompletion(
	queue: DBQueueAction[],
	started_at: Date
): { status: string; timings: { start: number; now: number; total: number } } {
	let totalActionTime: number = 0;
	queue.forEach((action: DBQueueAction) => {
		const loadedAction: Action | null = getAction(action.id);
		if (!loadedAction) return;

		totalActionTime += loadedAction.time * action.amount;
	});

	const startedMilliseconds: number = new Date(started_at).getTime();
	const now: number = Date.now();
	const totalActionTimeMilliseconds: number = totalActionTime * 1000;

	if (
		now - startedMilliseconds > totalActionTimeMilliseconds &&
		totalActionTimeMilliseconds < TEN_HOUR_ACTION_LIMIT
	) {
		return {
			status: 'Complete',
			timings: { start: startedMilliseconds, now, total: totalActionTimeMilliseconds }
		};
	}

	return {
		status: 'Active',
		timings: { start: startedMilliseconds, now, total: totalActionTimeMilliseconds }
	};
}



export function processQueue(queue: DBQueueAction[], started_at: Date) {
	const completion = checkQueueCompletion(queue, started_at);

	let outputs: { items: Item[] } = { items: [] };
	let elapsedTime: number = 0;

	if (completion.status === 'Complete') {
		queue.forEach((action: DBQueueAction) => {
			const loadedAction: Action | null = getAction(action.id);
			if (!loadedAction) return;

			for (let i = 0; i < action.amount; i++) {
				const result = completeAction(loadedAction);

				elapsedTime += result.time;

				outputs.items.push(...result.items);
				// addXp
			}
		});
		queue.length = 0;
	} else if (completion.status === 'Active') {
		let timeDifference: number = completion.timings.now - completion.timings.start;
		let currentTimeDeficit: number = 0;
		do {
			let action = queue[0];
			const loadedAction: Action | null = getAction(action.id);
			if (!loadedAction) continue;

			currentTimeDeficit += loadedAction.time * 1000;
			elapsedTime = currentTimeDeficit

			console.log(currentTimeDeficit, "/", timeDifference)
			if (currentTimeDeficit > timeDifference) {
				console.log(`Current time deficit: ${currentTimeDeficit}\nTime difference: ${timeDifference}`)
				elapsedTime = currentTimeDeficit;
				break;
			}

			action.amount--;
			if (action.amount <= 0) queue.shift();

			outputs = { items: [...outputs.items, ...completeAction(loadedAction).items] };
		}
		while (currentTimeDeficit < timeDifference && queue.length >= 1)

	}

	console.log(`Elapsed time: ${elapsedTime}\nOutputs: ${JSON.stringify(outputs)}\n\n`)

	return { outputs, queue, elapsedTime };
} */

export function getInventoryCounts(
	inventory: Inventory,
	inputs: { item: Item; amount: number }[]
): { id: string; required: number; present: number }[] {
	return inputs.map(({ item, amount }) => {
		let count: number = 0;
		const stackableModifier: StackableModifier | undefined = item.modifiers.find(
			(m) => m.type == 'Stackable'
		) as StackableModifier;
		if (stackableModifier) {
			inventory.contents
				.filter((i) => i.id === item.id)
				.forEach((instance: Item) => {
					count += (instance.modifiers.find((m) => m.type === 'Stackable') as StackableModifier)
						.amount;
				});
		} else {
			count = inventory.contents.filter((i) => i.id === item.id).length;
		}
		return {
			id: item.id,
			required: amount,
			present: count
		};
	});
}

export function loadDbQueue(queue: DBQueueAction[]): Map<number, Action> {
	let _: Map<number, Action> = new Map();
	queue.forEach((a: DBQueueAction, index) => {
		const act: Action | null = getAction(a.id);
		if (act) _.set(index, act);
	});
	return _;
}

export function rollValue(item: ChanceItem): number {
	return Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
}

export function rollChance(item: ChanceItem): boolean {
	// No chance means always succeeds
	if (!item.chance || item.chance <= 1) return true;
	return Math.floor(Math.random() * item.chance) === 0;
}

export type QueueCompletedData = {
	id: string;
	amount: number;
	outputs: {
		items: Item[]
	}
};

export function processQueueUntilNow(queue: DBQueueAction[], currentActionStart: Date): { queue: DBQueueAction[]; completed: QueueCompletedData[]; currentActionStart: number } {
	const now = Date.now();
	const currentActionTime: number = currentActionStart.getTime();
	const elapsed = now - currentActionTime;

	let outputs: { items: Item[] } = { items: [] };
	let timeUsed: number = 0;
	let completed: QueueCompletedData[] = [];

	do {
		let dbAction = queue[0];
		let action: Action = getAction(dbAction.id)!;

		const actionTimeMS = action.time * 1000;

		if (timeUsed + actionTimeMS > elapsed) break;

		timeUsed += actionTimeMS;

		dbAction.amount--;

		outputs = { items: [...outputs.items, ...completeAction(action).items] };

		if (dbAction.amount <= 0) {
			completed.push({
				...dbAction,
				outputs
			});
			outputs.items.length = 0;
			queue.shift();
		}

	} while (timeUsed < elapsed && queue.length > 0)

	const newStartedAt = currentActionTime + timeUsed;


	return { queue, completed, currentActionStart: newStartedAt };
}

export function getQueueProgress(
	queue: DBQueueAction[],
	currentActionStartedAt: number
): {
	progress: number; // 0-1 for current action
	nextPollIn: number | null; // ms until next action completes
	estimatedCompletion: number | null;
} {
	if (queue.length === 0) {
		return { progress: 0, nextPollIn: null, estimatedCompletion: null };
	}

	const now = Date.now();
	const action = queue[0];
	const loadedAction = getAction(action.id);

	if (!loadedAction) {
		return { progress: 0, nextPollIn: 0, estimatedCompletion: null };
	}

	const actionDuration = loadedAction.time * 1000;
	const elapsed = now - currentActionStartedAt;
	const progress = Math.min(1, elapsed / actionDuration);
	const remaining = Math.max(0, actionDuration - elapsed);

	return {
		progress,
		nextPollIn: remaining,
		estimatedCompletion: currentActionStartedAt + actionDuration
	};
}

export function completeAction(action: Action): { items: Item[]; time: number } {
	let outputs: { items: Item[]; time: number } = { items: [], time: action.time * 1000 };

	action.outputs.items.forEach((item: ChanceItem) => {
		if (rollChance(item)) {
			const amount: number = rollValue(item);
			for (let i = 0; i < amount; i++) {
				const loadedItem: Item = loadDbItem({ id: item.id });
				outputs.items = tryStackItemInInventory(loadedItem, outputs.items).contents;
			}
		}
	});

	return outputs;
}