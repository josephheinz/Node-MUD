import { faSquareWebAwesome } from '@fortawesome/free-brands-svg-icons';
import { faCode, faMedal, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { escapeRegExp } from './general';
import { encodeDBItem } from './item';
import { chatItemLinkTable } from '$lib/store.svelte';
import type { Item } from '$lib/types/item';
import { wsManager } from '$lib/websocketManager';

export const BadgeReferences: Record<string, { icon: IconDefinition; color: string }> = {
	owner: {
		icon: faSquareWebAwesome,
		color: '#4287f5'
	},
	VIP: {
		color: '#00ff00',
		icon: faMedal
	},
	'Beta-Tester': {
		color: '#cf3708',
		icon: faCode
	}
};

export function sendMessage(message: string, username: string, ws: WebSocket) {
	if (!message.trim()) return;

	let msg = prepareMessage(message, chatItemLinkTable);

	ws.send(
		JSON.stringify({
			type: 'chat-message',
			data: {
				author: username,
				content: msg,
				timestamp: Date.now()
			}
		})
	);

	chatItemLinkTable.clear();
}

export function prepareMessage(msg: string, itemLinkTable: Map<number, Item>): string {
	const itemLinkRegex = /\[ItemLink#\d+\]/g;
	const tokens = msg.match(itemLinkRegex) ?? [];
	let payload: string = msg;

	tokens.forEach((token: string) => {
		const index = Number(token.match(/\d+/)?.[0]);
		const item = itemLinkTable.get(index);
		if (item) {
			payload = payload.replace(
				new RegExp(escapeRegExp(token), 'g'),
				`[item:${JSON.stringify(encodeDBItem(item))}]`
			);
		}
	});

	return payload;
}

export type ChatMessage = {
	author: {
		username: string;
		badges: string[];
	};
	content: string;
	timestamp: number;
};
