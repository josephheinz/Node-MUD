import { supabase } from '$lib/auth/supabaseClient';
import type { EnhancerModifier } from '$lib/modifiers/basicModifiers.js';
import { ReforgeableModifier } from '$lib/modifiers/reforges.js';
import type { InventoryRow } from '$lib/types.svelte';
import { serializeEquipment, type Equipment, type EquipmentSlot } from '$lib/types/equipment';
import type { DBItem, Item } from '$lib/types/item.js';
import { encodeDbItem, loadDbItem, previewEnhanceItem } from '$lib/utils/item';
import { hydrateEquipment } from '../../../../../lib/types/equipment';

export async function POST({ request, params, cookies }) {
	const { id } = params;
	const { dbItem, dbEnhancer } = await request.json();

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
	const equipment: Equipment = hydrateEquipment(equipment_data) ?? {};

	// Find item in inventory
	const itemIndex = inventory.findIndex((i) => JSON.stringify(i) === JSON.stringify(dbItem));
	const enhancerIndex = inventory.findIndex(
		(e) => JSON.stringify(e) === JSON.stringify(dbEnhancer)
	);
	let slot: EquipmentSlot | undefined;
	if (itemIndex === -1) {
		// If not found, check if it's already equipped
		slot = Object.entries(equipment).find(([_, i]) => i?.id === dbItem.id)?.[0] as
			| keyof Equipment
			| undefined;
	}

	if (enhancerIndex === -1) {
		throw new Error("Enhancer item not present in user's inventory");
	}

	if (!slot && itemIndex === -1)
		return new Response(JSON.stringify({ error: 'Item not in inventory or equipped' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});

	// Load full item from dbItem
	const item: Item = loadDbItem(dbItem);
	const enhancer: Item = loadDbItem(dbEnhancer);

	const affectedReforgeGroup: ReforgeableModifier = item?.modifiers.find(
		(mod) => mod.type === 'Reforgeable'
	) as ReforgeableModifier;
	const canEnhance: boolean = enhancer.modifiers.some(
		(mod) =>
			mod.type === 'Enhancer' &&
			((mod as EnhancerModifier).enhances.includes(affectedReforgeGroup.group) ||
				(mod as EnhancerModifier).enhances.includes('any'))
	);

	if (!canEnhance) throw new Error(`${enhancer.name} is not able to enhance ${item.name}`);

	const newItem: Item = previewEnhanceItem(item, enhancer);

	// Encode item back to db format
	const newDbItem = encodeDbItem(newItem);

	if (itemIndex === -1 && slot) {
		// Update equipped item
		equipment[slot] = newItem;
		inventory.splice(enhancerIndex, 1);
		const { data: updateData, error: updateError } = await supabase
			.from('inventories')
			.update({ equipment_data: serializeEquipment(equipment), inventory_data: inventory })
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
		inventory[itemIndex] = newDbItem;
		inventory.splice(enhancerIndex, 1);
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
				serializedEquipment: equipment_data,
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
