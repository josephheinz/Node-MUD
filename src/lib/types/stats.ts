import { cloneDeep } from "radashi";
import { computeItemStats, type Equipment, type EquipmentSlot, type Item } from "./item";
import type { EnemyStats } from "./enemy";

export type StatList = Record<string, Stat>;

export type Stat = {
    amount: number;
    operation?: "additive" | "multiplicative";
}

export const Stats: Record<string, { icon: string; color: string; name: string; }> = {
    health: {
        icon: "♥",
        color: "#6cf23f",
        name: "Health"
    },
    strength: {
        icon: "δ",
        color: "#eb4034",
        name: "Strength"
    },
    defense: {
        icon: "℧",
        color: "#73c2fa",
        name: "Defense"
    },

    critChance: {
        icon: "✧",
        color: "#2a67b8",
        name: "Crit Chance"
    },
    critDamage: {
        icon: "🕱",
        color: "#2a67b8",
        name: "Crit Damage"
    },
    speed: {
        icon: "λ",
        color: "white",
        name: "Speed"
    },
    damage: {
        icon: "֎",
        color: "#eb4034",
        name: "Damage"
    }
}

export function enemyStatsToStatList(enemy: EnemyStats): StatList {
    return {
        health: { amount: enemy.health },
        maxHealth: { amount: enemy.maxHealth },
        strength: { amount: enemy.strength },
        defense: { amount: enemy.defense },
        critChance: { amount: enemy.critChance },
        critDamage: { amount: enemy.critDamage },
        damage: { amount: enemy.damage }
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