import { supabase } from '$lib/auth/supabaseClient';
import { getAction, type Action, type DBQueueAction } from '$lib/types/action.js';
import type { DBItem, Item } from '$lib/types/item';
import { getInventoryCounts, processQueue, removeInputsFromInventory } from '$lib/utils/action.js';
import { encodeDbItem, hydrateInventory, tryStackItemInInventory } from '$lib/utils/item.js';
import { getItem } from '$lib/types/item';

export async function GET({ params, cookies }) {
	const { id } = params;

	// Load supabase session
	const sessionCookie = cookies.get('supabase.session');
	if (!sessionCookie) {
		return Response.json({}, { status: 404, statusText: 'No session found' });
	}

	let sessionParsed: any;
	try {
		sessionParsed = JSON.parse(sessionCookie);
	} catch {
		return Response.json({}, { status: 400, statusText: 'Invalid session cookie' });
	}

	const refresh_token = sessionParsed.refresh_token;
	const { data: user_data, error: user_error } = await supabase.auth.refreshSession({
		refresh_token
	});

	if (user_error || !user_data?.user || user_data.user.id !== id) {
		return Response.json({}, { status: 401, statusText: 'Unauthorized' });
	}

	const { data, error } = await supabase.from('actions').select('*').eq('player_id', id);

	if (error) throw new Error(error.message);

	if (data.length == 1) {
		const processedQueue = processQueue(data[0].queue, data[0].started_at);
		const { data: invData, error: invError } = await supabase
			.from('inventories')
			.select('inventory_data')
			.eq('player_id', id);

		if (invError) throw new Error(invError.message);

		// Inventory is an array of Item objects
		const inventory: Item[] = hydrateInventory(invData[0].inventory_data);

		// Combining old inventory with new outputs from the queue
		let updatedInv: Item[] = [...inventory];
		processedQueue.outputs.forEach((output: Item) => {
			updatedInv = tryStackItemInInventory(output, updatedInv);
		});
		let updatedDBInv: DBItem[] = [];

		updatedInv.forEach((item: Item) => {
			updatedDBInv.push(encodeDbItem(item));
		});

		const updatedQueue: DBQueueAction[] = processedQueue.queue;

		if (data[0].started_at != null && updatedQueue.length <= 0) {
			const { error: updateStartErr } = await supabase
				.from('actions')
				.update({ started_at: null })
				.eq('player_id', id);

			if (updateStartErr) throw new Error(updateStartErr.message);
		} else if (data[0].started_at != null && updatedQueue.length >= 1) {
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
			.select('*');
		if (updateQueueErr) throw new Error(updateQueueErr.message);

		return Response.json(
			{ queue: updatedQueue, started: updateQueueData[0].started_at, inventory: updatedInv },
			{ status: 200 }
		);
	}

	return Response.json({ queue: undefined, started: undefined }, { status: 404 });
}

export async function POST({ request, params, cookies }) {
	const { id } = params;
	const { actionID, amount }: { actionID: string; amount: number } = await request.json();
	console.log(amount);
	// Load supabase session
	const sessionCookie = cookies.get('supabase.session');
	if (!sessionCookie) {
		return Response.json({}, { status: 404, statusText: 'No session found' });
	}

	let sessionParsed: any;
	try {
		sessionParsed = JSON.parse(sessionCookie);
	} catch {
		return Response.json({}, { status: 400, statusText: 'Invalid session cookie' });
	}

	const refresh_token = sessionParsed.refresh_token;
	const { data: user_data, error: user_error } = await supabase.auth.refreshSession({
		refresh_token
	});

	if (user_error || !user_data?.user || user_data.user.id !== id) {
		return Response.json({}, { status: 401, statusText: 'Unauthorized' });
	}

	// Load and update user's action queue
	const action: Action | null = getAction(actionID);
	if (!action)
		return Response.json(
			{},
			{ status: 400, statusText: 'Provided action ID not found in action registry' }
		);

	const dbAction: DBQueueAction = { action, amount };

	const { data: invData, error: invErr } = await supabase
		.from('inventories')
		.select('inventory_data')
		.eq('player_id', id);

	if (!invData || invData.length <= 0)
		throw new Error('Player does not have an inventory, so inputs cannot be taken out');

	const inventory: Item[] = hydrateInventory(invData[0].inventory_data);

	let loadedInputs: { item: Item; amount: number }[] = [];

	action.inputs.ids = action.inputs.ids ?? [];
	action.inputs.amounts = action.inputs.amounts ?? [];

	for (let i = 0; i < action.inputs.ids.length; i++) {
		const itemId = action.inputs.ids[i];
		const requiredAmount = action.inputs.amounts[i] * amount; // Scale by queue amount
		const loadedItem: Item | null = getItem(itemId);

		if (loadedItem) {
			loadedInputs.push({ item: loadedItem, amount: requiredAmount });
		}
	}

	const inputsPresent = getInventoryCounts(inventory, loadedInputs);

	const canAfford = inputsPresent.every((input) => input.present >= input.required);

	if (!canAfford) {
		return Response.json({ status: 'Insufficient items in inventory.' }, { status: 403 });
	}

	const updatedInventory: Item[] = removeInputsFromInventory(inventory, loadedInputs);

	const { data: getData, error: getError } = await supabase
		.from('actions')
		.select('*')
		.eq('player_id', id);

	if (!getData || getError) throw new Error(getError.message);

	const currentQueue: DBQueueAction[] = getData[0].queue as DBQueueAction[];

	const updatedQueue: DBQueueAction[] = [...currentQueue, dbAction];
	const started_at: Date = getData[0].started_at ?? new Date(Date.now());

	const { data: setData, error: setError } = await supabase
		.from('actions')
		.update({ queue: updatedQueue, started_at })
		.eq('player_id', id)
		.select();

	// Must encode updated inventory array for the database
	let updatedDBInv: DBItem[] = [];
	updatedInventory.forEach((item: Item) => {
		updatedDBInv.push(encodeDbItem(item));
	});

	const { error: setInvErr } = await supabase
		.from('inventories')
		.update({ inventory_data: updatedDBInv })
		.eq('player_id', id);

	if (!setData || setError) throw new Error(setError.message);
	if (setInvErr) throw new Error(setInvErr.message);

	return Response.json({ queue: setData[0].queue, inventory: updatedInventory }, { status: 200 });
}
