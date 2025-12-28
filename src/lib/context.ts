import { type User } from '@supabase/supabase-js';
import { Context } from 'runed';
import { Equipment, Inventory } from './types/item';

export type Profile = {
	id: string;
	username: string;
	joined_at: Date;
	last_logged_in: Date;
	profile_picture: string;
	display_name: string;
	accolades: string[];
};

export const userContext = new Context<User>('userContext');
export const profileContext = new Context<Profile>('profileContext');
export const inventoryContext = new Context<Inventory>('inventoryContext');
export const equipmentContext = new Context<Equipment>('equipmentContext');
