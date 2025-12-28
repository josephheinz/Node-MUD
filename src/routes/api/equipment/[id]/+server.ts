import { supabase } from '$lib/auth/supabaseClient';

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
		return Response.json({ equipment: data.equipment_data }, { status: 200 });
	}

	return Response.json({ equipment: undefined }, { status: 404 });
}
