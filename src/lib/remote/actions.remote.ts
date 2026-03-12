import { command, form, getRequestEvent, query } from '$app/server';
import { getAction, type DBQueueAction, type ActionInput } from '$lib/types/action';
import { getQueueProgress, processQueueUntilNow, getInventoryCounts } from '$lib/utils/action';
import { redirect } from '@sveltejs/kit';
import * as z from 'zod';
import { getInventory } from './inventory.remote';
import { Inventory } from '$lib/types/item';
import { encodeDBItem, tryStackItemInInventory, loadDbItem } from '$lib/utils/item';
import type { SkillKey } from '$lib/types/skills';
import { getSkills } from './skills.remote';
import { StackableModifier } from '$lib/modifiers/basicModifiers';


export const getQueue = query(async () => {
	const { locals } = getRequestEvent();
	const { user, supabase } = locals;

	if (!user) redirect(307, "/");

	const { data, error } = await supabase
		.from("actions")
		.select("started_at, queue")
		.eq("player_id", user.id)
		.single();

	if (error) throw new Error(error.message);
	if (!data) throw new Error('No actions found in the database');

	const queue: DBQueueAction[] = data.queue;

	if (queue.length === 0) return {
		queue: [],
		currentActionStartedAt: null,
		completed: [],
		progress: 0,
		nextPollIn: null,
		estimatedCompletion: null,
		currentActionDuration: null
	}

	const currentStartedAt = data.started_at ? new Date(data.started_at) : new Date(Date.now());
	const result = processQueueUntilNow(queue, currentStartedAt);

	if (result.totalOutputs.items.length > 0 || Object.values(result.totalOutputs.xp).some(v => v > 0)) {
		let updatedInv = await getInventory();
		let skillData = await getSkills();

		result.totalOutputs.items.forEach(item => {
			updatedInv = new Inventory(tryStackItemInInventory(item, updatedInv).contents);
		});
		Object.entries(result.totalOutputs.xp).forEach(([skill, value]) => {
			skillData[skill as SkillKey].xp += value;
		});

		await supabase
			.from("inventories")
			.update({ inventory_data: updatedInv.serialize() })
			.eq("player_id", user.id);

		await supabase
			.from("skills")
			.update({ skills_data: skillData })
			.eq("player_id", user.id);

		await supabase
			.from("actions")
			.update({
				queue: result.queue,
				started_at: result.queue.length > 0 ? new Date(result.currentActionStart) : null
			})
			.eq("player_id", user.id)
	}

	const progress = getQueueProgress(result.queue, result.currentActionStart);

	// Get current action duration for client-side progress calculation
	let currentActionDuration = null;
	if (result.queue.length > 0) {
		const loadedAction = getAction(result.queue[0].id);
		if (loadedAction) {
			currentActionDuration = loadedAction.time * 1000;
		}
	}

	return {
		queue: result.queue,
		currentActionStartedAt: result.queue.length > 0 ? result.currentActionStart : null,
		completed: [],
		progress: progress.progress,
		nextPollIn: progress.nextPollIn,
		estimatedCompletion: progress.estimatedCompletion,
		currentActionDuration
	};
});

const queueActionSchema = z.object({
	id: z.string(),
	amount: z.int()
});

export const queueAction = form(queueActionSchema, async (data) => {
	const { locals } = getRequestEvent();

	const { user, supabase } = locals;

	if (!user) redirect(307, '/');
	const action = getAction(data.id);
	if (!action) throw new Error(`Invalid action id: ${data.id}`);

	data.amount = Math.floor(data.amount);
	const id = user.id;

	// Get current inventory
	let currentInventory = await getInventory();

	// Consume inputs
	for (const input of action.inputs) {
		const required = input.amount * data.amount;
		let remaining = required;

		const matchingItems = currentInventory.contents.filter(i => i.id === input.id);
		for (const item of matchingItems) {
			if (remaining <= 0) break;
			const stackMod = item.modifiers.find(m => m.type === 'Stackable') as StackableModifier;
			if (stackMod) {
				const toRemove = Math.min(remaining, stackMod.amount);
				stackMod.amount -= toRemove;
				remaining -= toRemove;
				if (stackMod.amount <= 0) {
					currentInventory.contents.splice(currentInventory.contents.indexOf(item), 1);
				}
			} else {
				currentInventory.contents.splice(currentInventory.contents.indexOf(item), 1);
				remaining--;
			}
		}
		if (remaining > 0) throw new Error(`Not enough ${input.id} required: ${required}, available: ${required - remaining}`);
	}

	// Update inventory in DB
	await supabase
		.from("inventories")
		.update({ inventory_data: currentInventory.serialize() })
		.eq("player_id", id);

	const { data: currentQueue, error } = await supabase
		.from('actions')
		.select('queue, started_at')
		.eq('player_id', id)
		.single();

	if (!data || error) {
		throw new Error('Queue not found on the database');
	}

	const updatedQueue: DBQueueAction[] = [
		...currentQueue.queue,
		{ id: data.id, amount: data.amount }
	];

	const { error: updateQueueErr } = await supabase
		.from('actions')
		.update({ queue: updatedQueue, started_at: currentQueue.started_at != null ? currentQueue.started_at : new Date(Date.now()) })
		.eq('player_id', id);

	if (updateQueueErr) throw new Error(updateQueueErr.message);
});

const updatedQueueSchema = z.array(
	z.object({
		id: z.string(),
		amount: z.int()
	})
);

export const deleteFromQueue = command(updatedQueueSchema, async (updatedQueue) => {
	const { locals } = getRequestEvent();

	const { user, supabase } = locals;

	if (!user) throw new Error();
	const id = user.id;

	const { error } = await supabase
		.from('actions')
		.update({ queue: updatedQueue })
		.eq('player_id', id);
	if (error) throw new Error(error.message);
});
