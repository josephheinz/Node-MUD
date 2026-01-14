import { command, form, getRequestEvent, query } from '$app/server';
import { getAction, type DBQueueAction } from '$lib/types/action';
import { getQueueProgress, processQueueUntilNow } from '$lib/utils/action';
import { redirect } from '@sveltejs/kit';
import * as z from 'zod';
import { getInventory } from './inventory.remote';
import { Inventory } from '$lib/types/item';
import { encodeDBItem, tryStackItemInInventory } from '$lib/utils/item';

/* 
export const getQueue = query(async () => {
	const { locals } = getRequestEvent();
	const { user, supabase } = locals;

	if (!user) redirect(307, '/');

	const { data, error } = await supabase
		.from('actions')
		.select('*')
		.eq('player_id', user.id)
		.single();

	if (error) throw new Error(error.message);
	if (!data) throw new Error('No actions found in the database');

	const queue: DBQueueAction[] = data.queue;
    
	// If queue is empty, return early
	if (queue.length === 0) {
		return {
			queue: [],
			currentActionStartedAt: null,
			completed: [],
			progress: 0,
			nextPollIn: null,
			estimatedCompletion: null,
			currentActionDuration: null
		};
	}

	const currentStartedAt = data.started_at ? new Date(data.started_at).getTime() : Date.now();
	const result = processQueueUntilNow(queue, currentStartedAt);

	// If actions completed, update database
	if (result.completed.length > 0) {
		const { data: invData, error: invError } = await supabase
			.from('inventories')
			.select('inventory_data')
			.eq('player_id', user.id)
			.single();
		if (invError) throw new Error(invError.message);

		let updatedInv = Inventory.load(invData.inventory_data);
		result.completed.forEach(completion => {
			completion.outputs.items.forEach(item => {
				updatedInv = new Inventory(tryStackItemInInventory(item, updatedInv).contents);
			});
		});

		await supabase
			.from('inventories')
			.update({ inventory_data: updatedInv.serialize() })
			.eq('player_id', user.id);

		await supabase
			.from('actions')
			.update({
				queue: result.queue,
				started_at: result.queue.length > 0 ? new Date(result.currentActionStartedAt) : null
			})
			.eq('player_id', user.id);
	}

	const progress = getQueueProgress(result.queue, result.currentActionStartedAt);

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
		currentActionStartedAt: result.queue.length > 0 ? result.currentActionStartedAt : null,
		completed: result.completed.map(completion => ({
			actionId: completion.actionId,
			amount: completion.amount,
			outputs: {
				items: completion.outputs.items.map(item => encodeDBItem(item))
			}
		})),
		progress: progress.progress,
		nextPollIn: progress.nextPollIn,
		estimatedCompletion: progress.estimatedCompletion,
		currentActionDuration
	};
});*/

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

	if (result.completed.length > 0) {
		let updatedInv = await getInventory();

		result.completed.forEach((completion) => {
			completion.outputs.items.forEach(item => {
				updatedInv = new Inventory(tryStackItemInInventory(item, updatedInv).contents);
			});
		});

		await supabase
			.from("inventories")
			.update({ inventory_data: updatedInv.serialize() })
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
		completed: result.completed.map(completion => ({
			actionId: completion.id,
			amount: completion.amount,
			outputs: {
				items: completion.outputs.items.map(item => encodeDBItem(item))
			}
		})),
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
	if (!getAction(data.id)) throw new Error(`Invalid action id: ${data.id}`);
	const id = user.id;

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
