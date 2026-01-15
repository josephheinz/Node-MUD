import { cloneDeep } from "radashi";
import { computeItemStats, type Equipment, type EquipmentSlot, type Item } from "./item";

export type StatList = Record<string, Stat>;

export type Stat = {
    amount: number;
    operation: "additive" | "multiplicative";
}

export const Stats: Record<string, { icon: string; color: string }> = {
    health: {
        icon: "♥",
        color: "#6cf23f"
    },
    strength: {
        icon: "δ",
        color: "#eb4034"
    },
    defense: {
        icon: "℧",
        color: "#73c2fa"
    },

    "crit chance": {
        icon: "✧",
        color: "#2a67b8"
    },
    "crit damage": {
        icon: "🕱",
        color: "#2a67b8"
    },
    speed: {
        icon: "λ",
        color: "white"
    },
    damage: {
        icon: "֎",
        color: "#eb4034"
    }
}

export function getModifiedStats(stats: StatList, equipment: Equipment): StatList {
    const result: StatList = cloneDeep<StatList>(stats); // copy so references to an original Stats store doesn't get changed
    let itemStats: Record<string, Record<string, { base: number; added: number; }>> = {};

    for (const key in equipment) {
        const slot = key as EquipmentSlot;
        const item: Item | null = equipment[slot];
        if (!item) continue;

        let equipmentItemStats = computeItemStats(item);
        itemStats[slot] = equipmentItemStats;
    }

    Object.values(itemStats).forEach((itemStats: Record<string, { base: number; added: number; }>) => {
        Object.entries(itemStats).forEach(([stat, amounts]) => {
            Object.values(amounts).forEach((val) => {
                if (result[stat] != undefined) {
                    result[stat].amount += Number(val);
                }
            });
        });
    });

    return result;
}