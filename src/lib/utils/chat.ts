import type { Item } from "$lib/types/item";
import { socketStore } from "$lib/stores/socket.svelte";
import * as store from "$lib/store";
import { escapeRegExp } from "./general";
import Fa from "svelte-fa";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faSquareWebAwesome } from "@fortawesome/free-brands-svg-icons";
import { faCode, faMedal } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "$lib/auth/supabaseClient";

/**
 * Append an item reference token to a chat message and register the item in the provided link table.
 *
 * @param itemLinkTable - Mapping of numeric link indices to `Item` objects used to resolve item tokens in messages
 * @param message - The chat message to which the item token will be appended
 * @param item - The `Item` to store and reference from the message
 * @returns An object containing the updated message (with a new `[ItemLink#N]` token) and the updated `itemLinkTable` with the item stored at that index
 */
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

export const AccoladeReferences: Record<string, { icon: IconDefinition, color: string }> = {
    "owner": {
        icon: faSquareWebAwesome,
        color: "#4287f5"
    },
    "VIP": {
        color: "#00ff00",
        icon: faMedal
    },
    "Beta-Tester": {
        color: "#cf3708",
        icon: faCode
    }
};

/**
 * Replace item link tokens like `[ItemLink#n]` in a chat message with serialized item representations.
 *
 * @param msg - The message text that may contain `[ItemLink#<index>]` tokens
 * @param itemLinkTable - Mapping from numeric indices to `Item` objects used to resolve tokens
 * @returns The message with each resolved token replaced by `[item:<JSONifiedItem>]`; unresolved tokens are left unchanged
 */
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

/**
 * Send a chat message to the specified room.
 *
 * @returns `''` (an empty string). No message is sent if `msg` is empty or `currentRoom` is falsy.
 */
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

/**
 * Split a chat message into plain-text segments and embedded Item objects.
 *
 * @param message - The chat message that may contain embedded items using the `[item:<JSON>]` token syntax.
 * @returns An array containing plain-text string segments and parsed `Item` objects; if an embedded item's JSON cannot be parsed, the original token is returned as a string in the form `[item:<json>]`.
 */
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

export async function getAccoladesForUser(username: string): Promise<Array<keyof typeof AccoladeReferences>> {
    const { data, error } = await supabase
        .from("profiles")
        .select("accolades")
        .eq("username", username)
        .single();

    if (error) throw new Error(error.message);

    return data.accolades;
}