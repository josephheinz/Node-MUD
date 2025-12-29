import type { Profile } from '$lib/store.svelte';
import {
	EmptyEquipment,
	Equipment,
	initializeItemRegistry,
	type DBEquipment,
	type DBItem
} from '$lib/types/item';
import { fetchUserData } from '$lib/utils/general.js';
import type { User } from '@supabase/supabase-js';

export async function load({ cookies, fetch, locals }): Promise<{
	profile: Profile | null;
	user: User | null;
	inventory: DBItem[];
	equipment: DBEquipment;
	/* stats: typeof Stats;
	queue: DBQueueAction[];
	started: Date;
	skills: typeof PlayerSkills; */
}> {
	const supabase = locals.supabase;
	initializeItemRegistry();

	const sessionCookie = cookies.get('supabase.session');
	if (!sessionCookie) {
		return {
			profile: null,
			user: null,
			inventory: [],
			equipment: new Equipment({}).serialize()
			/*
			stats: Stats,
			queue: [],
			skills: PlayerSkills
			*/
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
			equipment: new Equipment({}).serialize()
			/*
			stats: Stats,
			queue: [],
			skills: PlayerSkills
			*/
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
	const [/* queueData, */ inventoryData, equipmentData /*statsData, skillsData */] =
		await Promise.all([
			//fetchUserData<{ queue: DBQueueAction[]; started: Date }>('action', userId),
			fetchUserData<{ inventory: DBItem[] }>('inventory', userId, fetch),
			fetchUserData<{ equipment: DBEquipment }>('equipment', userId, fetch)
			//fetchUserData<{ stats: typeof Stats }>('stats', userId),
			//fetchUserData<{ skills: typeof PlayerSkills }>('skills', userId)
		]);

	return {
		profile,
		user,
		inventory: inventoryData?.inventory ?? [],
		equipment: equipmentData?.equipment ?? EmptyEquipment
		//stats: statsData?.stats ?? Stats,
		//queue: queueData?.queue ?? [],
		//started: queueData?.started ?? new Date(Date.now()),
		//skills: skillsData?.skills ?? PlayerSkills
	};
}
