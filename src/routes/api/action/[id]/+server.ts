import { supabase } from '$lib/auth/supabaseClient';
import type { DBQueueAction } from '$lib/types/action';
import { Inventory, type DBInventory, type Item } from '$lib/types/item';
import { processQueue, type ProcessedQueue } from '$lib/utils/action';
import { tryStackItemInInventory } from '$lib/utils/item';

export async function GET({ params, locals }) {
	const { id } = params;

	const user = locals.user;

	if (!user || user?.id !== id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

	const { data, error } = await supabase.from('actions').select('*').eq('player_id', id).single();

	if (error) throw new Error(error.message);

	if (!data) return Response.json({ queue: undefined, started: undefined }, { status: 404 });

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

	return Response.json(
		{
			queue: updatedQueue,
			started: updateQueueData.started_at,
			inventory: updatedDBInv
		},
		{ status: 200 }
	);
}
