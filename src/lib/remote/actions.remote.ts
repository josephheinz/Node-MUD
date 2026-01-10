import { command, form, getRequestEvent, query } from '$app/server';
import { getAction, type DBQueueAction } from '$lib/types/action';
import { Inventory, type DBInventory, type Item } from '$lib/types/item';
import { processQueue, type ProcessedQueue } from '$lib/utils/action';
import { tryStackItemInInventory } from '$lib/utils/item';
import { redirect } from '@sveltejs/kit';
import * as z from 'zod';

export const getQueue = query(async () => {
	const { locals } = getRequestEvent();

	const { user, supabase } = locals;

	if (!user) redirect(307, '/');
	const id = user.id;

	const { data, error } = await supabase.from('actions').select('*').eq('player_id', id).single();

	if (error) throw new Error(error.message);

	if (!data) throw new Error('No actions found in the data base');

	const processedQueue: ProcessedQueue = processQueue(data.queue, data.started_at);

	const { data: invData, error: invError } = await supabase
		.from('inventories')
		.select('inventory_data')
		.eq('player_id', id)
		.single();
	if (invError) throw new Error(invError.message);

	// loading skills here in the future
	const inventory: Inventory = Inventory.load(invData.inventory_data);

	let updatedInv: Inventory = new Inventory(inventory.contents);
	processedQueue.outputs.items.forEach((output: Item) => {
		updatedInv = new Inventory(tryStackItemInInventory(output, updatedInv).contents);
	});
	let updatedDBInv: DBInventory = updatedInv.serialize();

	const updatedQueue: DBQueueAction[] = processedQueue.queue;

	if (data.started_at != null && updatedQueue.length <= 0) {
		const { error: updateStartErr } = await supabase
			.from('actions')
			.update({ started_at: null })
			.eq('player_id', id);

		if (updateStartErr) throw new Error(updateStartErr.message);
	} else if (data.started_at != null && updatedQueue.length >= 1) {
		const { error: updateStartErr } = await supabase
			.from('actions')
			.update({ started_at: new Date(Date.now()) })
			.eq('player_id', id);

		if (updateStartErr) throw new Error(updateStartErr.message);
	}

	const { error: updateInvErr } = await supabase
		.from('inventories')
		.update({ inventory_data: updatedDBInv })
		.eq('player_id', id);
	if (updateInvErr) throw new Error(updateInvErr.message);

	const { data: updateQueueData, error: updateQueueErr } = await supabase
		.from('actions')
		.update({ queue: updatedQueue })
		.eq('player_id', id)
		.select('*')
		.single();
	if (updateQueueErr) throw new Error(updateQueueErr.message);

	return {
		queue: updatedQueue,
		started: updateQueueData.started_at as Date,
		inventory: updatedDBInv,
		lastUpdated: Date.now()
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
		.update({ queue: updatedQueue, started_at: currentQueue.started_at ?? new Date(Date.now()) })
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

	const { data, error } = await supabase
		.from('actions')
		.update({ queue: updatedQueue })
		.eq('player_id', id)
		.select()
		.single();
	if (error) throw new Error(error.message);
});
