import { deepClone } from "$lib/utils/general";
import type { Equipment, EquipmentSlot } from "./equipment";
import { computeItemStats, type Item } from "./item";

export type Stat = {
    name: string;
    icon: string;
    amount: number;
};

export type StatList = Record<string, number>;

export const Stats: StatList = {
    health: 100,
    strength: 0,
    defense: 0,
    "crit chance": 1,
    "crit damage": 50,
    speed: 100
};

export const StatIcons: Record<string, string> = {
    health: "♡",
    strength: "δ",
    defense: "℧",
    "crit chance": "✧",
    "crit damage": "🕱",
    speed: "λ"
};


export function getModifiedStats(stats: StatList, equipment: Equipment): StatList {
    const result: StatList = deepClone<StatList>(stats); // copy so references to an original Stats store doesn't get changed
    let itemStats: Record<string, Record<string, { base: number; modifiers: number; reforges: number; }>> = {};

    for (const key in equipment) {
        const slot = key as EquipmentSlot;
        const item: Item | null = equipment[slot];
        if (!item) continue;

        let equipmentItemStats = computeItemStats(item);
        itemStats[slot] = equipmentItemStats;
    }

    Object.values(itemStats).forEach((itemStats: Record<string, { base: number; modifiers: number; reforges: number; }>) => {
        Object.entries(itemStats).forEach(([stat, amounts]) => {
            Object.values(amounts).forEach((val) => {
                if (result[stat] != undefined) {
                    result[stat] += Number(val);
                }
            });
        });
    });

    return result;
}