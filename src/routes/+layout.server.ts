import { supabase } from '$lib/auth/supabaseClient.js';
import { type Item } from '$lib/types/item.js';
import { Stats } from '$lib/types/stats.js';
import { EmptyEquipment } from '$lib/types/equipment';
import type { DBQueueAction } from '$lib/types/action.js';

/**
 * Load the current authenticated user (if any) and assemble their inventory, equipment, stats, action queue, and queue start time for page initialization.
 *
 * If no session cookie is present, `user` will be `null` and the returned collections will be empty or defaulted.
 *
 * @returns An object with:
 *  - `profile`: the authenticated profile object or `null` when not authenticated,
 *  - `inventory`: an array of items belonging to the user,
 *  - `equipment`: the user's equipment object,
 *  - `stats`: the user's stats object,
 *  - `queue`: an array of queued actions for the user,
 *  - `started`: the timestamp when the queue processing started.
 */
export async function load({ cookies, fetch }) {
	// Load supabase session
	const sessionCookie = cookies.get('supabase.session');
	if (!sessionCookie) {
		return {
			user: null,
			inventory: [],
			equipment: EmptyEquipment,
			stats: Stats,
			queue: []
		};
	}

	let sessionParsed = JSON.parse(sessionCookie);

	const refresh_token = sessionParsed.refresh_token;
	const { data, error } = await supabase.auth.refreshSession({ refresh_token });

	if (error) {
		console.log(error.message);
	}

	const { session, user } = data;

	if (!user) return { user, inventory: [], equipment: EmptyEquipment };

	// Update last time logged in
	const { data: d, error: e } = await supabase
		.from('profiles')
		.update({ last_logged_in: new Date(Date.now()) })
		.eq('id', user.id);

	if (e) {
		console.log(e);
	}

	// Load inventory
	const userId = user?.id;

	const { data: profile, error: pError } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	let queue: DBQueueAction[] = [];
	let started: Date = new Date(Date.now());

	const loadQueue = await fetch(`/api/action/${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(async (response) => {
			let responseJson = await response.json();
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return responseJson;
		})
		.then(async (data) => {
			queue = data.queue;
			started = data.started;
		})
		.catch((error) => {
			console.error(error);
		});

	let inventory: Item[] = [];

	const loadInventory = await fetch(`/api/inventory/${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(async (response) => {
			let responseJson = await response.json();
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return responseJson;
		})
		.then(async (data) => {
			inventory = data.inventory;
		})
		.catch((error) => {
			console.error(error);
		});

	// Load equipment
	let equipment = EmptyEquipment;

	const loadEquipment = await fetch(`/api/equipment/${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(async (response) => {
			let responseJson = await response.json();
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return responseJson;
		})
		.then(async (data) => {
			equipment = data.equipment;
		})
		.catch((error) => {
			console.error(error);
		});

	let stats = { ...Stats };

	const loadStats = await fetch(`/api/stats/${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(async (response) => {
			let responseJson = await response.json();
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return responseJson;
		})
		.then(async (data) => {
			stats = data.stats;
		})
		.catch((error) => {
			console.error(error);
		});

	return { profile, inventory, equipment, stats, queue, started };
}
