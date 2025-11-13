import { type Action, type DBQueueAction, type ChanceItem, rollChance, rollValue, actionCategories } from "$lib/types/action";
import type { Item } from "$lib/types/item";
import { loadDbItem } from "./item";

export function checkQueueCompletion(queue: DBQueueAction[], started_at: Date): { status: string; timings: { start: number; now: number; total: number; } } {
    let totalActionTime: number = 0;
    queue.forEach((action: DBQueueAction) => {
        totalActionTime += action.amount * action.action.time;
    });

    const startedMilliseconds: number = new Date(started_at).getTime();
    const now: number = Date.now();
    const totalActionTimeMilliseconds: number = totalActionTime * 1000;

    if (now - startedMilliseconds > totalActionTimeMilliseconds) {
        return { status: "Complete", timings: { start: startedMilliseconds, now, total: totalActionTimeMilliseconds } };
    }

    return { status: "Active", timings: { start: startedMilliseconds, now, total: totalActionTimeMilliseconds } };
}

export function getInventoryCounts(inventory: Item[], inputs: { item: Item; amount: number }[]): { id: string; required: number; present: number }[] {
    return inputs.map(({ item, amount }) => {
        const count = inventory.filter(i => i.id === item.id).length;
        return {
            id: item.id,
            required: amount,
            present: count,
        };
    });
}

export function removeInputsFromInventory(
    inventory: Item[],
    inputs: { item: Item; amount: number }[]
): Item[] {
    // Make a mutable copy of remaining counts per id
    const remaining = Object.fromEntries(
        inputs.map(({ item, amount }) => [item.id, amount])
    );

    // Filter out items used for the action
    return inventory.filter(i => {
        const needed = remaining[i.id];
        if (needed && needed > 0) {
            remaining[i.id]--;
            return false;
        }
        return true;
    });
}


export function processQueue(queue: DBQueueAction[], started_at: Date): { outputs: Item[]; queue: DBQueueAction[] } {
    const completion = checkQueueCompletion(queue, started_at);

    let outputs: Item[] = [];

    if (completion.status === "Complete") {
        queue.forEach((action: DBQueueAction) => {
            for (let i = 0; i < action.amount; i++) {
                outputs = [...outputs, ...completeAction(action.action)];
            }
        });
        queue = [];
    } else if (completion.status === "Active") {
        let timeDifference: number = completion.timings.now - completion.timings.start;
        let currentTimeDeficit: number = 0;
        while (currentTimeDeficit < timeDifference && queue.length >= 1) {
            let action = queue[0]
            currentTimeDeficit += action.action.time * 1000;

            if (currentTimeDeficit > timeDifference) break;

            action.amount--;
            if (action.amount <= 0) queue.shift();

            outputs = [...outputs, ...completeAction(action.action)];
        }
    }

    return { outputs, queue };
}

export function completeAction(action: Action): Item[] {
    let outputs: Item[] = [];

    action.outputs.items.forEach((item: ChanceItem) => {
        const loadedItem: Item = loadDbItem({ id: item.id });
        if (rollChance(item)) {
            const amount: number = rollValue(item);
            outputs.push(...Array(amount).fill(loadedItem));
        }
    });

    return outputs;
}