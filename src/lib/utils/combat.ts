export function damageCalculation(stats: { damage: number; strength: number; critChance: number; critDamage: number; }): number {
    const critHit: boolean = Math.random() * 100 < stats.critChance;
    return (stats.damage + (stats.strength * 0.5)) * (1 + stats.strength / 100) * (critHit ? (1 + stats.critDamage) : 1);
}