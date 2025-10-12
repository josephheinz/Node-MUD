import type { Item } from "$lib/types/item";
import { socketStore } from "$lib/stores/socket.svelte";
import * as store from "$lib/store";
import { escapeRegExp } from "./general";

export function linkToChat(
    itemLinkTable: Record<number, Item>,
    message: string,
    item: Item
): { message: string, itemLinkTable: Record<number, Item> } {
    const nextIndex = Object.keys(itemLinkTable).length + 1;
    message += `[ItemLink#${nextIndex}]`;
    itemLinkTable[nextIndex] = item;
    return { message, itemLinkTable };
}

export function prepareMessage(msg: string, itemLinkTable: Record<number, Item>): string {
    const itemLinkRegex = /\[ItemLink#\d+\]/g;
    const tokens = msg.match(itemLinkRegex) ?? [];
    let payload: string = msg;

    tokens.forEach((token: string) => {
        const index = Number(token.match(/\d+/)?.[0]);
        const item = itemLinkTable[index];
        if (item) {
            payload = payload.replace(
                new RegExp(escapeRegExp(token), 'g'),
                `[item:${JSON.stringify(item)}]`
            );
        }
    });

    return payload;
}

export function sendMessage(msg: string, username: string, itemLinkTable: Record<number, Item>) {
    if (!msg.trim()) return;

    msg = prepareMessage(msg, itemLinkTable);
    socketStore.emit('message', {
        author: username,
        content: msg,
        timestamp: Date.now()
    });

    store.chatItemLinkTable.set({});
    store.chatMessage.set('');
}

export function joinRoom(currentRoom: string, room: string) {
    if (currentRoom) {
        socketStore.emit('leave-room', currentRoom);
    }
    socketStore.emit('join-room', room);
    currentRoom = room;
}

export function sendRoomMessage(msg: string, username: string, currentRoom: string): string {
    if (!msg.trim() || !currentRoom) return "";

    socketStore.emit('room-message', {
        room: currentRoom,
        message: {
            author: username,
            content: msg,
            timestamp: Date.now()
        }
    });

    return '';
}


export function extractItemsFromMessage(message: string): (string | Item)[] {
    const result: (string | Item)[] = [];
    let cursor = 0;

    while (true) {
        const start = message.indexOf("[item:", cursor);
        if (start === -1) {
            // push remaining text
            result.push(message.slice(cursor));
            break;
        }

        // push text before item
        if (start > cursor) result.push(message.slice(cursor, start));

        let depth = 0;
        let end = start + 6; // position after "[item:"
        let inString = false;

        while (end < message.length) {
            const char = message[end];

            if (char === '"' && message[end - 1] !== "\\") {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') depth++;
                else if (char === '}') depth--;

                if (depth === 0) break;
            }
            end++;
        }

        const jsonStr = message.slice(start + 6, end + 1); // include final }
        try {
            result.push(JSON.parse(jsonStr) as Item);
        } catch {
            result.push("[item:" + jsonStr + "]");
        }

        cursor = end + 2; // position after closing ]
    }

    return result;
}

