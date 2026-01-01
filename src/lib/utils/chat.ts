import { faSquareWebAwesome } from '@fortawesome/free-brands-svg-icons';
import { faCode, faMedal, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { escapeRegExp } from './general';
import { encodeDBItem, loadDbItem } from './item';
import { chatItemLinkTable, currentChatMessage } from '$lib/store.svelte';
import type { DBItem, Item } from '$lib/types/item';
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
	currentChatMessage.value = '';
}

export function linkItemToChat(item: Item) {
	const index: number = chatItemLinkTable.size + 1;
	chatItemLinkTable.set(index, item);
	currentChatMessage.value += `[ItemLink#${index}]`;
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

export type messagePart = {
	type: 'text' | 'item';
	content: string | Item;
};

export function extractItemsFromMessage(message: string): Set<messagePart> | string {
	const result: Set<messagePart> = new Set();
	// dont question the regex
	const regex = /\[item:\{"id":"([^"]+)","modifiers":\[((?:"[^"]*"(?:,)?)*)\]\}\]/g;

	let lastIndex = 0;

	for (const match of message.matchAll(regex)) {
		if (match.index > lastIndex) {
			result.add({
				type: 'text',
				content: message.slice(lastIndex, match.index)
			});
		}

		const modifiers = match[2].match(/"([^"]+)"/g)?.map((m) => m.slice(1, -1)) || [];
		const item: Item = loadDbItem({
			id: match[1],
			modifiers
		});
		console.log(item);
		result.add({
			type: 'item',
			content: item
		});

		lastIndex = match.index + match[0].length;
	}

	if (message.matchAll(regex).toArray().length === 0) return message;

	if (lastIndex < message.length) {
		result.add({
			type: 'text',
			content: message.slice(lastIndex)
		});
	}

	return result;
}

export type ChatMessage<T = string | Set<messagePart>> = {
	author: {
		username: string;
		badges: string[];
	};
	content: T;
	timestamp: number;
};
