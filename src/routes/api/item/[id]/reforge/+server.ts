import { supabase } from '$lib/auth/supabaseClient';
import { instantiateModifier } from '$lib/modifiers/modifiersRegistry.js';
import { ReforgeModifier, rollReforge, type ReforgeGroup } from '$lib/modifiers/reforges.js';
import type { InventoryRow } from '$lib/types.svelte';
import { serializeEquipment, type Equipment, type EquipmentSlot } from '$lib/types/equipment';
import type { DBItem, Item } from '$lib/types/item.js';
import { encodeDbItem, loadDbItem } from '$lib/utils/item';

/**
 * Handle POST requests to reforge a player's item and persist the change to either inventory or equipment.
 *
 * Accepts a JSON body with `dbItem` and uses `params.id` and the `supabase.session` cookie to authenticate and authorize the player.
 *
 * @param request - The incoming Request whose JSON body must contain `dbItem` (the database representation of the item to reforge).
 * @param params - Route parameters; `params.id` is the player's id to operate on.
 * @param cookies - Cookie store used to read the `supabase.session` cookie for session refresh and authorization.
 * @returns A Response containing JSON. On success with status 200 it includes a message, the updated serialized equipment or inventory, and `updatedItem`. On error it returns an appropriate HTTP status and a JSON object with an `error` message.
 */
export async function POST({ request, params, cookies }) {
	const { id } = params;
	const { dbItem } = await request.json();

	// Load supabase session
	const sessionCookie = cookies.get('supabase.session');
	if (!sessionCookie) {
		return new Response(JSON.stringify({ error: 'No session' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let sessionParsed: any;
	try {
		sessionParsed = JSON.parse(sessionCookie);
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid session cookie' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const refresh_token = sessionParsed.refresh_token;
	const { data: user_data, error: user_error } = await supabase.auth.refreshSession({
		refresh_token
	});

	if (user_error || !user_data?.user || user_data.user.id !== id) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { user } = user_data;

	// Fetch current inventory/equipment
	const { data, error: fetchError } = await supabase
		.from('inventories')
		.select('inventory_data, equipment_data')
		.eq('player_id', id)
		.single();

	if (fetchError || !data) {
		return new Response(JSON.stringify({ error: fetchError?.message || 'Not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { inventory_data, equipment_data } = data as InventoryRow;

	const inventory: DBItem[] = inventory_data ?? [];
	const equipment: Equipment = equipment_data ?? {};

	// Find item in inventory
	const index = inventory.findIndex((i) => JSON.stringify(i) === JSON.stringify(dbItem));
	let slot: EquipmentSlot | undefined;
	if (index === -1) {
		// If not found, check if it's already equipped
		slot = Object.entries(equipment).find(([_, i]) => i?.id === dbItem.id)?.[0] as
			| keyof Equipment
			| undefined;
	}

	if (!slot && index === -1)
		return new Response(JSON.stringify({ error: 'Item not in inventory or equipped' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});

	// Load full item from dbItem
	const item: Item = loadDbItem(dbItem);

	let reforgeable = item.modifiers.find((m) => m.type === 'Reforgeable');
	if (!reforgeable) {
		return new Response(JSON.stringify({ error: 'Item is not reforgeable' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const currentReforge = item.modifiers.find((m) => m.type === 'Reforge');
	const currentReforgeIndex = currentReforge ? item.modifiers.indexOf(currentReforge) : -1;
	if (currentReforgeIndex !== -1) {
		item.modifiers.splice(currentReforgeIndex, 1);
	}

	const reforgeGroup = (reforgeable as any).group as ReforgeGroup;
	const reforge = rollReforge(reforgeGroup);

	item.modifiers.push(instantiateModifier(new ReforgeModifier(reforge.name)));

	// Encode item back to db format
	const newDbItem = encodeDbItem(item);

	if (index === -1 && slot) {
		// Update equipped item
		equipment[slot] = item;
		const { data: updateData, error: updateError } = await supabase
			.from('inventories')
			.update({ equipment_data: serializeEquipment(equipment) })
			.eq('player_id', id)
			.select()
			.single();

		if (updateError || !updateData) {
			return new Response(
				JSON.stringify({ error: updateError?.message || 'Failed to update equipment' }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		return new Response(
			JSON.stringify({
				message: 'Item reforged and equipped',
				serializedEquipment: updateData.equipment_data,
				inventory: inventory_data,
				updatedItem: newDbItem
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} else {
		// Update inventory item
		inventory[index] = newDbItem;
		const { data: updateData, error: updateError } = await supabase
			.from('inventories')
			.update({ inventory_data: inventory })
			.eq('player_id', id)
			.select()
			.single();

		if (updateError || !updateData) {
			return new Response(
				JSON.stringify({ error: updateError?.message || 'Failed to update inventory' }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		return new Response(
			JSON.stringify({
				message: 'Item reforged',
				serializedEquipment: serializeEquipment(equipment_data),
				inventory: updateData.inventory_data,
				updatedItem: newDbItem
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}