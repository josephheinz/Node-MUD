import type { StackableModifier } from "$lib/modifiers/basicModifiers";
import { skills } from "$lib/store";
import { type Action, type DBQueueAction, type ChanceItem, rollChance, rollValue, actionCategories } from "$lib/types/action";
import type { Item } from "$lib/types/item";
import { PlayerSkills, type SkillKey } from "$lib/types/skills";
import { deepClone } from "./general";
import { loadDbItem, tryStackItemInInventory } from "./item";

/**
 * Determine whether a queue of actions has finished based on elapsed time.
 *
 * @param queue - Array of queued actions, each with an `amount` and an `action.time` (seconds)
 * @param started_at - The start time used to compute elapsed time for the queue
 * @returns An object with `status` ("Complete" if elapsed time exceeds total action time, otherwise "Active") and `timings` containing `start`, `now`, and `total` (all in milliseconds)
 */
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

/**
 * Calculate required and present counts for each input item in an inventory.
 *
 * @param inventory - Current list of inventory items
 * @param inputs - Array of required items with their required amounts
 * @returns An array of objects `{ id, required, present }` where `present` is the total available count:
 * - For items with a `Stackable` modifier, `present` is the sum of stack values across matching inventory instances.
 * - For non-stackable items, `present` is the number of matching inventory instances.
 */
export function getInventoryCounts(inventory: Item[], inputs: { item: Item; amount: number }[]): { id: string; required: number; present: number }[] {
    return inputs.map(({ item, amount }) => {
        let count: number = 0;
        const stackableModifier: StackableModifier | undefined = item.modifiers.find(
            (m) => m.type == 'Stackable'
        ) as StackableModifier;
        if (stackableModifier) {
            inventory.filter(i => i.id === item.id).forEach((instance: Item) => {
                count += (instance.modifiers.find(m => m.type === "Stackable") as StackableModifier).value;
            });
        } else {
            count = inventory.filter(i => i.id === item.id).length;
        }
        return {
            id: item.id,
            required: amount,
            present: count,
        };
    });
}

/**
 * Consume specified input quantities from an inventory, updating stack values or removing items as required.
 *
 * @param inventory - Array of inventory items to consume from.
 * @param inputs - Array of objects describing which item (matched by `item.id`) and how many units to consume.
 * @returns The updated inventory after consumption: stackable items have their stack modifier value decreased (and are removed when it reaches zero); non-stackable items are removed one-per-unit consumed.
 */
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
            const stackableModifier: StackableModifier | undefined = i.modifiers.find(
                (m) => m.type == 'Stackable'
            ) as StackableModifier;
            if (stackableModifier) {
                const stackStartValue: number = stackableModifier.value;

                stackableModifier.value = Math.max(stackStartValue - remaining[i.id], 0);
                remaining[i.id] = Math.max(remaining[i.id] - stackStartValue, 0);

                // if theres no more items in the stack remove it from the inventory
                if (stackableModifier.value === 0) return false;
                else return true;
            } else {
                remaining[i.id]--;
                return false;
            }
        }
        return true;
    });
}


const emptyXpOutput: Record<SkillKey, number> = {
    "Mining": 0,
    "Crafting": 0
}

/**
 * Process queued actions relative to a start time, producing items for completed steps and updating the queue.
 *
 * @param queue - Array of queued actions; the function may mutate this array in-place to remove completed units.
 * @param started_at - Start timestamp used to calculate elapsed processing time for the queue.
 * @returns An object with `outputs`, the items produced by any completed action steps, and `queue`, the updated queue after processing.
 */
export function processQueue(queue: DBQueueAction[], started_at: Date): { outputs: { items: Item[], xp: Record<SkillKey, number> }; queue: DBQueueAction[] } {
    const completion = checkQueueCompletion(queue, started_at);

    let outputs: { items: Item[], xp: Record<SkillKey, number> } = { items: [], xp: deepClone(emptyXpOutput) };

    if (completion.status === "Complete") {
        queue.forEach((action: DBQueueAction) => {
            for (let i = 0; i < action.amount; i++) {
                outputs = { items: [...outputs.items, ...completeAction(action.action).items], xp: { ...outputs.xp, ...completeAction(action.action).xp } };
            }
        });
        queue.length = 0;
    } else if (completion.status === "Active") {
        let timeDifference: number = completion.timings.now - completion.timings.start;
        let currentTimeDeficit: number = 0;
        while (currentTimeDeficit < timeDifference && queue.length >= 1) {
            let action = queue[0]
            currentTimeDeficit += action.action.time * 1000;

            if (currentTimeDeficit > timeDifference) break;

            action.amount--;
            if (action.amount <= 0) queue.shift();

            outputs = { items: [...outputs.items, ...completeAction(action.action).items], xp: { ...outputs.xp, ...completeAction(action.action).xp } };
        }
    }

    return { outputs, queue };
}

/**
 * Produce items generated by the given action's output definitions.
 *
 * @param action - The action whose configured ChanceItems will be rolled to determine produced items and amounts.
 * @returns An array of produced Items; successful chance rolls yield one or more Items (stacked when possible). 
 */
export function completeAction(action: Action): { items: Item[], xp: Record<SkillKey, number> } {
    let outputs: { items: Item[], xp: Record<SkillKey, number> } = {
        items: [], xp: deepClone(emptyXpOutput)
    };

    action.outputs.items.forEach((item: ChanceItem) => {
        if (rollChance(item)) {
            const amount: number = rollValue(item);
            for (let i = 0; i < amount; i++) {
                const loadedItem: Item = loadDbItem({ id: item.id });
                outputs.items = tryStackItemInInventory(loadedItem, outputs.items);
            }
            ///outputs.push(...Array(amount).fill(loadedItem));
        }
    });

    if (action.outputs.xp) {
        Object.entries(action.outputs.xp).forEach(([skill, value]) => {
            outputs.xp[skill as SkillKey] += value;
        });
    }

    return outputs;
}