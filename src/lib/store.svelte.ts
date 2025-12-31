import type { User } from '@supabase/supabase-js';
import { Inventory, Equipment } from './types/item';

export type Profile = {
	id: string;
	username: string;
	joined_at: Date;
	last_logged_in: Date;
	profile_picture: string;
	display_name: string;
	accolades: string[];
};

export const gameState = $state<{
	user: User | null;
	profile: Profile | null;
	inventory: Inventory;
	equipment: Equipment;
	playerCount: number;
}>({
	user: null,
	profile: null,
	inventory: new Inventory([]),
	equipment: new Equipment({}),
	playerCount: 0
});


export const sidebar = $state({ open: true });

export const tab = $state<{ tab: 'Home' | 'Inventory' | 'Equipment' }>({
	tab: 'Home'
});
