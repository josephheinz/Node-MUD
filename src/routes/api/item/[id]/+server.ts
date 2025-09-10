import { itemRegistry } from '$lib/items.js';

export async function GET({ params }) {
    const { id } = params;

    const item = itemRegistry[id];
    if (!item) throw new Error("Item not found");

    return Response.json({ item: item }, { status: 200 });
}