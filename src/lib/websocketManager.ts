import type { SupabaseClient } from '@supabase/supabase-js';
import type { Require } from './utils/general';
import { getWebSocketManager } from 'sveltekit-ws';

export type UserData = {
	userId: string;
	username: string;
	badges: string[];
	connectionIds: Set<string>;
};

export type PartialUserData = {
	userId: string;
	username: string;
	badges: string[];
};

type ConnectionId = string;
type UserId = string;

class WebsocketManager {
	private static instance: WebsocketManager;
	private userMap = new Map<UserId, UserData>();
	private connectionMap = new Map<ConnectionId, UserId>();
	private loadingUsers = new Map<UserId, Promise<UserData>>();

	private constructor() {}

	public static getInstance(): WebsocketManager {
		if (!WebsocketManager.instance) {
			WebsocketManager.instance = new WebsocketManager();
		}
		return WebsocketManager.instance;
	}

	private async loadUser(
		userId: UserId,
		connectionId: ConnectionId,
		supabase: SupabaseClient
	): Promise<UserData> {
		if (this.userMap.has(userId)) {
			return this.userMap.get(userId)!;
		}

		if (this.loadingUsers.has(userId)) {
			return this.loadingUsers.get(userId)!;
		}

		const promise = getUserData(userId, supabase).then((data) => {
			const filledData: UserData = { ...data, connectionIds: new Set([connectionId]) };
			this.userMap.set(userId, filledData);
			this.loadingUsers.delete(userId);

			const manager = getWebSocketManager();
			manager.send(connectionId, {
				type: 'player-count-update',
				data: {
					amount: this.userMap.size
				}
			});

			manager.broadcast(
				{
					type: 'player-count-update',
					data: { amount: this.userMap.size }
				},
				[connectionId]
			);

			return filledData;
		});

		this.loadingUsers.set(userId, promise);
		return promise;
	}

	addConnection(
		connectionId: string,
		userData: Require<Partial<UserData>, 'userId'>,
		supabase: SupabaseClient
	) {
		const user: UserId = this.connectionMap.get(connectionId) ?? userData.userId;
		const userInstance: UserData | undefined = this.userMap.get(user);
		if (!userInstance) {
			void this.loadUser(user, connectionId, supabase);
			this.connectionMap.set(connectionId, user);
			return;
		}

		this.connectionMap.set(connectionId, user);
		userInstance.connectionIds.add(connectionId);

		const manager = getWebSocketManager();
		manager.send(connectionId, {
			type: 'player-count-update',
			data: {
				amount: this.userMap.size
			}
		});

		manager.broadcast(
			{
				type: 'player-count-update',
				data: { amount: this.userMap.size }
			},
			[connectionId]
		);

		return;
	}

	removeConnection(connectionId: string) {
		const user: UserData | undefined = this.getUserByConnection(connectionId);
		const userId: UserId | undefined = user?.userId;

		if (!user || !userId) throw new Error('User is not connected');

		this.connectionMap.delete(connectionId);
		user.connectionIds.delete(connectionId);

		if (user.connectionIds.size === 0) {
			this.userMap.delete(userId);
		} else {
			this.userMap.set(userId, user);
		}

		const manager = getWebSocketManager();
		manager.broadcast({
			type: 'player-count-update',
			data: {
				amount: this.userMap.size
			}
		});
	}

	getUser(userId: UserId): UserData | null {
		return this.userMap.get(userId) ?? null;
	}

	getUserByConnection(connectionId: string): UserData | undefined {
		const userId: UserId | undefined = this.connectionMap.get(connectionId);
		if (userId && this.userMap.has(userId)) {
			return this.userMap.get(userId);
		}

		return;
	}

	getPlayerCount(): number {
		return this.userMap.size;
	}
}

export const wsManager = WebsocketManager.getInstance();

async function getUserData(userId: string, supabase: SupabaseClient): Promise<PartialUserData> {
	const { data, error } = await supabase
		.from('profiles')
		.select('username, badges')
		.eq('id', userId)
		.single();

	if (error || !data) throw new Error(error?.message ?? 'Supabase error');

	return {
		userId: userId,
		username: data.username,
		badges: data.badges
	};
}
