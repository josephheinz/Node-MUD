import type { Item } from "./items";

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
