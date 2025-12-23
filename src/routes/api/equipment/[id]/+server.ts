import { supabase } from '$lib/auth/supabaseClient';
import type { Equipment } from '$lib/types/equipment.js';
import { ensureItemModifiers } from '$lib/utils/item';

export async function GET({ params }) {
	const { id } = params;

	const { data, error } = await supabase
		.from('inventories')
		.select('equipment_data')
		.eq('player_id', id)
		.single();

	if (error) {
		throw new Error(`${error.message}`);
	}

	if (data) {
		Object.values(data.equipment_data as Equipment).forEach((item) => {
			if (item) ensureItemModifiers(item);
		});
		return Response.json({ equipment: data.equipment_data }, { status: 200 });
	}

	return Response.json({ equipment: undefined }, { status: 404 });
}
