import { supabase } from '$lib/auth/supabaseClient';
import { ensureItemModifiers } from '$lib/utils/item.js';

export async function GET({ params }) {
	const { id } = params;

	const { data, error } = await supabase
		.from('inventories')
		.select('inventory_data')
		.eq('player_id', id)
		.single();

	if (error) {
		throw new Error(`${error.message}`);
	}

	if (data) {
		const inventory = data.inventory_data;
		return Response.json({ inventory }, { status: 200 });
	}

	return Response.json({ inventory: undefined }, { status: 404 });
}
