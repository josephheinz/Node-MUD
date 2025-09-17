import type { Item } from "./items";
import type { Equipment, EquipmentSlot } from "./types";

export type Stat = {
    name: string;
    icon: string;
    amount: number;
};

export type StatList = Record<string, { amount: number }>;

export const Stats: StatList = {
    health: { amount: 100 },
    strength: { amount: 0 },
    defense: { amount: 0 },
    "crit chance": { amount: 1 },
    "crit damage": { amount: 50 },
    speed: { amount: 100 }
};

export const StatIcons: Record<string, string> = {
    health: "♡",
    strength: "δ",
    defense: "℧",
    "crit chance": "✧",
    "crit damage": "Ψ",
    speed: "λ"
};


export function getModifiedStats(stats: StatList, equipment: Equipment): StatList {
    let itemStatMods: { name: string; amount: number }[] = [];
    for (const key in equipment) {
        const slot = key as EquipmentSlot;
        const item: Item | null = equipment[slot];
        if (!item) continue;

        item.modifiers.forEach((mod) => {
            if (mod.type.toLowerCase() in Object.keys(Stats)) {
                let amount = typeof mod.value === "number" ? mod.value : 0;
                itemStatMods.push({ name: mod.type.toLowerCase(), amount });
            }
        });
    }

    itemStatMods.forEach((mod) => {
        stats[mod.name].amount += mod.amount;
    });

    return stats;
}