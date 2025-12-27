import { supabase } from '$lib/auth/supabaseClient';
import { getAction, type Action, type DBQueueAction } from '$lib/types/action.js';
import type { DBItem, Item } from '$lib/types/item';
import { getInventoryCounts, processQueue, removeInputsFromInventory } from '$lib/utils/action.js';
import { encodeDbItem, hydrateInventory, tryStackItemInInventory } from '$lib/utils/item.js';
import { getItem } from '$lib/types/item';
import { xpToLevel, type Skill, type SkillKey } from '$lib/types/skills.js';

/**
 * Validate the user's session, process their action queue (applying completed outputs to inventory), persist any inventory and queue updates, and return the current queue state and inventory.
 *
 * @param params - Route parameters; must include `id` (the player's id used for authorization and data lookup)
 * @param cookies - Request cookies; must include the `supabase.session` cookie used to refresh and validate the session
 * @returns An HTTP JSON response. On success (200) returns `queue` (updated queue array), `started` (timestamp or null), and `inventory` (updated Item[]). If no action row is found returns `{ queue: undefined, started: undefined }` with 404. Session-related errors return an appropriate 4xx response.
 */
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

	const { data, error } = await supabase
		.from('actions')
		.select('*')
		.eq('player_id', id)
		.single();

	if (error) throw new Error(error.message);

	if (data) {
		const processedQueue = processQueue(data.queue, data.started_at);
		const { data: invData, error: invError } = await supabase
			.from('inventories')
			.select('inventory_data')
			.eq('player_id', id)
			.single();
		if (invError) throw new Error(invError.message);

		const { data: skillData, error: skillError } = await supabase
			.from('skills')
			.select('skills_data')
			.eq('player_id', id)
			.single();
		if (skillError) throw new Error(skillError.message);

		// Inventory is an array of Item objects
		const inventory: Item[] = hydrateInventory(invData.inventory_data);

		// Combining old inventory with new outputs from the queue
		let updatedInv: Item[] = [...inventory];
		processedQueue.outputs.items.forEach((output: Item) => {
			updatedInv = tryStackItemInInventory(output, updatedInv);
		});
		let updatedDBInv: DBItem[] = [];

		updatedInv.forEach((item: Item) => {
			updatedDBInv.push(encodeDbItem(item));
		});

		const updatedQueue: DBQueueAction[] = processedQueue.queue;

		Object.entries(processedQueue.outputs.xp).forEach(([skill, value]) => {
			skillData.skills_data[skill as SkillKey].xp += value;
		});

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

		const { error: updateSkillsErr } = await supabase
			.from('skills')
			.update({ skills_data: skillData.skills_data })
			.eq('player_id', id);
		if (updateSkillsErr) throw new Error(updateSkillsErr.message);

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
				inventory: updatedInv,
				skills: skillData.skills_data
			},
			{ status: 200 }
		);
	}

	return Response.json({ queue: undefined, started: undefined }, { status: 404 });
}

/**
 * Enqueues a requested action for the specified player after validating the session, action ID, and available inventory.
 *
 * Validates the Supabase session cookie, ensures the authenticated user matches the route `id`, verifies the action exists, checks and deducts required input items from the player's inventory, appends the action to the player's queue (setting `started_at` if needed), persists updated inventory and queue to the database, and returns the updated in-memory inventory and queue.
 *
 * @returns JSON containing the updated `queue` and the updated in-memory `inventory` on success; on failure returns an HTTP error response with an appropriate status for cases including missing/invalid session, unauthorized user, unknown action ID, insufficient inventory, or database errors.
 */
export async function POST({ request, params, cookies }) {
	const { id } = params;
	const { actionID, amount: postAmount }: { actionID: string; amount: number } = await request.json();

	const amount = Math.floor(postAmount);

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

	const { data: skillData, error: skillErr } = await supabase
		.from('skills')
		.select('skills_data')
		.eq('player_id', id)
		.single();

	if (!skillData)
		throw new Error('Player does not have skills initialized, so skill checks cannot be done');

	const skillAction: Skill | null = dbAction.action.requirement
		? (skillData.skills_data as Record<SkillKey, Skill>)[
		dbAction.action.requirement.name as SkillKey
		]
		: null;

	if (skillAction && dbAction.action.requirement) {
		if (xpToLevel(skillAction.xp) < xpToLevel(dbAction.action.requirement.xp)) {
			throw new Error(
				`Player's ${skillAction.name} skill's level is not high enough: ${xpToLevel(skillAction.xp)}/${xpToLevel(dbAction.action.requirement.xp)}`
			);
		}
	}

	const { data: invData, error: invErr } = await supabase
		.from('inventories')
		.select('inventory_data')
		.eq('player_id', id)
		.single();

	if (!invData) throw new Error('Player does not have an inventory, so inputs cannot be taken out');

	const inventory: Item[] = hydrateInventory(invData.inventory_data);

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

export async function PUT({ request, params, cookies }) {
	const { id } = params;
	const { updatedQueue }: { updatedQueue: DBQueueAction[] } = await request.json();

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

	const { data, error } = await supabase
		.from('actions')
		.update({ queue: updatedQueue })
		.eq('player_id', id)
		.select()
		.single();
	if (error) throw new Error(error.message);

	return Response.json({ queue: data.queue }, { status: 200 });
}
