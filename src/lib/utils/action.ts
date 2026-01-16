import type { StackableModifier } from '$lib/modifiers/basicModifiers';
import { getAction, type Action, type ChanceItem, type DBQueueAction } from '$lib/types/action';
import type { Inventory, Item } from '$lib/types/item';
import type { SkillKey } from '$lib/types/skills';
import { cloneDeep } from 'radashi';
import { loadDbItem, tryStackItemInInventory } from './item';

export type ProcessedQueue = {
	outputs: { items: Item[] };
	queue: DBQueueAction[];
};

export const TEN_HOUR_ACTION_LIMIT: number = 10 * 60 * 60 * 1000; // ten hours times 60 minutes times 60 seconds times 1000 milliseconds

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

export function loadDbQueue(queue: DBQueueAction[]): Action[] {
	let _: Action[] = []
	queue.forEach((a: DBQueueAction, index) => {
		const act: Action | null = getAction(a.id);
		if (act) _.push(act);
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
		items: Item[];
		xp: Record<SkillKey, number>;
	}
};

export const emptyXpOutput: Record<SkillKey, number> = {
	"Mining": 0,
	"Crafting": 0
}

function addXp(
	target: Record<SkillKey, number>,
	source: Record<SkillKey, number>
) {
	for (const skill in source) {
		target[skill as SkillKey] += source[skill as SkillKey];
	}
}

export function processQueueUntilNow(queue: DBQueueAction[], currentActionStart: Date): { queue: DBQueueAction[]; completed: QueueCompletedData[]; currentActionStart: number } {
	const now = Date.now();
	const currentActionTime: number = currentActionStart.getTime();
	const elapsed = now - currentActionTime;

	let outputs: { items: Item[], xp: Record<SkillKey, number> } = { items: [], xp: cloneDeep(emptyXpOutput) };
	let timeUsed: number = 0;
	let completed: QueueCompletedData[] = [];

	do {
		let dbAction = queue[0];
		let action: Action = getAction(dbAction.id)!;

		const actionTimeMS = action.time * 1000;

		if (timeUsed + actionTimeMS > elapsed) break;

		timeUsed += actionTimeMS;

		dbAction.amount--;

		outputs = { items: [...outputs.items, ...completeAction(action).items], xp: { ...outputs.xp, ...completeAction(action).xp } };

		completed.push({
			...dbAction,
			outputs
		});

		if (dbAction.amount <= 0) {
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

export function completeAction(action: Action): { items: Item[]; time: number, xp: Record<SkillKey, number> } {
	let outputs: { items: Item[]; time: number, xp: Record<SkillKey, number> } = { items: [], time: action.time * 1000, xp: cloneDeep(emptyXpOutput) };

	action.outputs.items.forEach((item: ChanceItem) => {
		if (rollChance(item)) {
			const amount: number = rollValue(item);
			for (let i = 0; i < amount; i++) {
				const loadedItem: Item = loadDbItem({ id: item.id });
				outputs.items = tryStackItemInInventory(loadedItem, outputs.items).contents;
			}
		}
	});

	if (action.outputs.xp) {
		Object.entries(action.outputs.xp).forEach(([skill, value]) => {
			outputs.xp[skill as SkillKey] += value;
		});
	}

	return outputs;
}