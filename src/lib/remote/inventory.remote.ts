import { getRequestEvent, query } from '$app/server';
import { supabase } from '$lib/auth/supabaseClient';
import { Inventory } from '$lib/types/item';
import { redirect } from '@sveltejs/kit';

export const getInventory = query(async () => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		redirect(307, "/");
	}

	const { data, error } = await supabase
		.from('inventories')
		.select('inventory_data')
		.eq('player_id', locals.user.id)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	if (data) {
		const inventory = Inventory.load(data.inventory_data);
		return inventory;
	}

	throw new Error("Inventory not found in database");
});
