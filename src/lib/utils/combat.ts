import type { StatList } from "../types/stats";

export function damageCalculation(stats: StatList): { damage: number; crit: boolean } {
    const critHit: boolean = Math.random() * 100 < stats.critChance.amount;
    return { damage: (stats.damage.amount + (stats.strength.amount * 0.5)) * (1 + stats.strength.amount / 100) * (critHit ? (1 + (stats.critDamage.amount / 100)) : 1), crit: critHit };
}

export function defenseCalculation(stats: { defense: number }): number {
    return stats.defense * (100 / (100 + stats.defense));
}