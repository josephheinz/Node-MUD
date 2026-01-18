import type { User } from '@supabase/supabase-js';
import { Inventory, Equipment, type Item } from './types/item';
import type { ChatMessage, messagePart } from './utils/chat';
import type { DBQueueAction } from './types/action';

export type Profile = {
	id: string;
	username: string;
	joined_at: Date;
	last_logged_in: Date;
	profile_picture: string;
	banner_picture: string;
	display_name: string;
	badges: string[];
};

export const gameState = $state<{
	user: User | null;
	profile: Profile | null;
	inventory: Inventory;
	equipment: Equipment;
	playerCount: number;
	queue: { started: Date; queue: DBQueueAction[] };
}>({
	user: null,
	profile: null,
	inventory: new Inventory([]),
	equipment: new Equipment({}),
	playerCount: 0,
	queue: {
		started: new Date(0),
		queue: []
	}
});

export const chatMessages: {
	messages: ChatMessage<string>[];
	parsed: ChatMessage<Set<messagePart>>[];
} = $state({
	messages: [],
	parsed: []
});
export const chatItemLinkTable: Map<number, Item> = $state(new Map());
export const currentChatMessage: { value: string } = $state({ value: '' });

export const sidebar = $state({ open: true });

export const tab = $state<{
	tab: 'Home' | 'Inventory' | 'Equipment' | 'Actions' | 'Skills' | 'Forge';
}>({
	tab: 'Home'
});
