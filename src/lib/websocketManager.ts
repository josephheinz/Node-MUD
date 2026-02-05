import type { SupabaseClient } from '@supabase/supabase-js';
import type { Require } from './utils/general';
import { getWebSocketManager } from 'sveltekit-ws';
import type { UUID } from 'node:crypto';
import { playerInCombat, getOrCreateCombatInstance } from './server/combat';

export type UserData = {
	userId: UUID;
	username: string;
	badges: string[];
	connectionIds: Set<string>;
};

export type PartialUserData = {
	userId: UUID;
	username: string;
	badges: string[];
};

type ConnectionId = UUID;
type UserId = UUID;

class WebsocketManager {
	private static instance: WebsocketManager;
	private userMap = new Map<UserId, UserData>();
	private connectionMap = new Map<ConnectionId, UserId>();
	private loadingUsers = new Map<UserId, Promise<UserData>>();
	private combatInstances = new Map<UUID, Array<UserId>>();

	private constructor() { }

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

			manager.broadcast(
				{
					type: 'player-count-update',
					data: { amount: this.userMap.size }
				}
			);

			return filledData;
		});

		this.loadingUsers.set(userId, promise);
		return promise;
	}

	addConnection(
		connectionId: UUID,
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

		manager.broadcast(
			{
				type: 'player-count-update',
				data: { amount: this.userMap.size }
			}
		);

		return;
	}

	removeConnection(connectionId: UUID) {
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

	private createCombatInstance(): UUID {
		let uuid = crypto.randomUUID();
		while (this.combatInstances.has(uuid)) {
			uuid = crypto.randomUUID();
		}

		this.combatInstances.set(uuid, new Array<UserId>());

		return uuid;
	}

	addPlayerToCombatInstance(instanceId: UUID, userId: UserId): UUID {
		if (this.combatInstances.has(instanceId)) {
			const combatInstance = this.combatInstances.get(instanceId)!;
			if (combatInstance.includes(userId)) return instanceId;

			combatInstance.push(userId);
			return instanceId;
		} else {
			this.combatInstances.set(instanceId, new Array<UserId>())
			const combatInstance = this.combatInstances.get(instanceId)!;
			combatInstance.push(userId);

			return instanceId;
		}
	}

	getUser(userId: UserId): UserData | null {
		return this.userMap.get(userId) ?? null;
	}

	getUserByConnection(connectionId: UUID): UserData | undefined {
		const userId: UserId | undefined = this.connectionMap.get(connectionId);
		if (userId && this.userMap.has(userId)) {
			return this.userMap.get(userId);
		}

		return;
	}

	getBadges(userId: UUID): string[] {
		return this.userMap.get(userId)?.badges ?? [];
	}

	getPlayerCount(): number {
		return this.userMap.size;
	}

	getCombatInstanceByUser(userId: UserId): UUID | undefined {
		let instanceId: UUID | undefined;
		this.combatInstances.forEach((users, id) => {
			if (users.includes(userId)) instanceId = id;
		});

		return instanceId;
	}
}

export const wsManager = WebsocketManager.getInstance();

async function getUserData(userId: UUID, supabase: SupabaseClient): Promise<PartialUserData> {
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
