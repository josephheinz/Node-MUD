/* import { getQueue } from '$lib/remote/actions.remote.js';
import { getEquipment } from '$lib/remote/equipment.remote.js';
import { getInventory } from '$lib/remote/inventory.remote.js';
import type { Profile } from '$lib/store.svelte';
import type { DBQueueAction } from '$lib/types/action';
import {
	EmptyEquipment,
	Equipment,
	initializeItemRegistry,
	type DBEquipment,
	type DBItem
} from '$lib/types/item';
import type { User } from '@supabase/supabase-js';

export async function load({ cookies, locals }): Promise<{
	profile: Profile | null;
	user: User | null;
	inventory: DBItem[];
	equipment: DBEquipment;
	queue: DBQueueAction[];
	started: Date;
	/* stats: typeof Stats;
	skills: typeof PlayerSkills; 
}> {
	const supabase = locals.supabase;
	initializeItemRegistry();

	const sessionCookie = cookies.get('supabase.session');
	if (!sessionCookie) {
		return {
			profile: null,
			user: null,
			inventory: [],
			equipment: new Equipment({}).serialize(),
			queue: [],
			started: new Date(0)
			/*
			stats: Stats,
			skills: PlayerSkills
			
		};
	}

	const sessionParsed = JSON.parse(sessionCookie);
	const refresh_token = sessionParsed.refresh_token;

	const { data, error } = await supabase.auth.refreshSession({ refresh_token });

	if (error) {
		console.error('Session refresh error:', error.message);
	}

	const { user } = data;

	if (!user) {
		return {
			profile: null,
			user: null,
			inventory: [],
			equipment: new Equipment({}).serialize(),
			queue: [],
			started: new Date(0)
			/*
			stats: Stats,
			skills: PlayerSkills
			
		};
	}

	const userId = user.id;

	// Update user's last logged in time
	const { error: updateError } = await supabase
		.from('profiles')
		.update({ last_logged_in: new Date(Date.now()) })
		.eq('id', userId);

	if (updateError) {
		console.error('Profile update error:', updateError);
	}

	// Load profile
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single();

	if (profileError) {
		console.error('Profile fetch error:', profileError);
	}

	// Load all user data in parallel
	const [queueData, inventoryData, equipmentData /*statsData, skillsData ] = await Promise.all([
		getQueue(userId),
		getInventory(userId),
		getEquipment(userId)
		//fetchUserData<{ stats: typeof Stats }>('stats', userId),
		//fetchUserData<{ skills: typeof PlayerSkills }>('skills', userId)
	]);

	return {
		profile,
		user,
		inventory: queueData?.inventory ?? inventoryData?.inventory?.serialize() ?? [],
		equipment: equipmentData?.equipment?.serialize() ?? new Equipment({}).serialize(),
		queue: queueData?.queue ?? [],
		started: queueData?.started ?? new Date(Date.now())
		//stats: statsData?.stats ?? Stats,
		//skills: skillsData?.skills ?? PlayerSkills
	};
}
 */