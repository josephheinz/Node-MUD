import type { DBEquipment, DBInventory, DBItem, EquipmentSlot, Item } from '$lib/types/item';
import { canonicalizeDbItem, determineSlot, loadDbItem } from '$lib/utils/item';
import { isEqual } from 'radashi';

export async function POST({ request, params, cookies, locals }) {
	const user = locals.user;
	const { id } = params;
	if (!user || (user && user.id !== id))
		return Response.json({ error: 'Not authenticated' }, { status: 401 });

	const supabase = locals.supabase;
	const { dbItem } = await request.json();

	const { data, error: fetchError } = await supabase
		.from('inventories')
		.select('inventory_data, equipment_data')
		.eq('player_id', id)
		.single();

	if (fetchError || !data) {
		return Response.json({ error: fetchError?.message || 'Not found' }, { status: 404 });
	}

	const { inventory_data, equipment_data } = data as {
		inventory_data: DBInventory;
		equipment_data: DBEquipment;
	};

	const dbItemIndex = inventory_data.findIndex((i) => {
		const sortedI: DBItem = {
			...i,
			modifiers: [...(i.modifiers ?? [])].sort()
		};

		const sortedDbItem: DBItem = {
			...dbItem,
			modifiers: [...(dbItem.modifiers ?? [])].sort()
		};

		return isEqual(sortedI, sortedDbItem);
	});
	if (dbItemIndex === -1)
		return Response.json({ error: 'Item not found in inventory' }, { status: 404 });

	inventory_data.splice(dbItemIndex, 1);

	const item: Item = loadDbItem(dbItem);

	const slot: EquipmentSlot | undefined = determineSlot(item);
	if (!slot) return Response.json({ error: 'Item is not equippable' }, { status: 400 });

	// Update equipment slot with proper item
	if (equipment_data[slot]) {
		let equippedItem: DBItem = equipment_data[slot];

		equippedItem = canonicalizeDbItem(equippedItem);
		inventory_data.push(equippedItem);
	}

	equipment_data[slot] = dbItem;

	const { error: updateError } = await supabase
		.from('inventories')
		.update({ inventory_data, equipment_data })
		.eq('player_id', id);

	if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

	return Response.json({ inventory_data, equipment_data });
}
