import type { DBEquipment, DBInventory, DBItem, EquipmentSlot } from '$lib/types/item';

export async function POST({ request, params, cookies, locals }) {
	const user = locals.user;
	const { id } = params;
	if (!user || (user && user.id !== id))
		return Response.json({ error: 'Not authenticated' }, { status: 401 });

	const supabase = locals.supabase;
	const { slot }: { slot: EquipmentSlot } = await request.json();

	const { data, error: fetchError } = await supabase
		.from('inventories')
		.select('inventory_data, equipment_data')
		.eq('player_id', id)
		.single();

	const { inventory_data, equipment_data } = data as {
		inventory_data: DBInventory;
		equipment_data: DBEquipment;
	};

	const item: DBItem | null = equipment_data[slot];
	if (!item) return Response.json({ error: `No item in slot ${slot}` }, { status: 400 });

	equipment_data[slot] = null;
	inventory_data.push(item);

	const { error: updateError } = await supabase
		.from('inventories')
		.update({
			inventory_data,
			equipment_data
		})
		.eq('player_id', id);

	if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

	return Response.json({ inventory_data, equipment_data }, { status: 200 });
}
