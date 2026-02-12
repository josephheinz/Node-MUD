import { parse } from "yaml";
import type { ChanceItem } from "./action";
import type { SkillKey } from "./skills";

export type EnemySize = "Small" | "Medium" | "Large" | "Huge";

export type EnemyDrops = {
    items: ChanceItem[]
    xp?: Record<SkillKey, number>;
};

export type EnemyStats = {
    health: number;
    maxHealth: number;
    strength: number;
    damage: number;
    defense: number;
    critChance: number;
    critDamage: number;
}

export type Enemy = {
    id: string;
    name: string;
    level: number;
    icon: string;
    size: EnemySize;
    drops: EnemyDrops[];
    stats: EnemyStats;
};

export function parseYamlToEnemy(yamlString: string): Enemy {
    let enemy = parse(yamlString)[0];

    const stats: EnemyStats = {
        health: enemy.stats.health,
        maxHealth: enemy.stats.health,
        strength: enemy.stats.strength,
        damage: enemy.stats.damage,
        defense: enemy.stats.defense,
        critChance: enemy.stats.critChance,
        critDamage: enemy.stats.critDamage
    };

    return {
        id: enemy.id,
        name: enemy.name,
        level: enemy.level,
        icon: enemy.icon,
        size: enemy.size,
        drops: new Array<EnemyDrops>(enemy.drops ?? []),
        stats
    }
}

export const enemyRegistry: Record<string, Enemy> = {};

export function initializeEnemyRegistry() {
    if (Object.keys(enemyRegistry).length > 0) return;

    const enemies = import.meta.glob("$lib/enemies/**/*", { eager: true, as: "raw" });

    for (const enemy in enemies) {
        const id = enemy
            .split("/")
            .pop()!
            .replace(/\.[^/.]+$/, "");
        let _enemy = (enemies[enemy] as any).default ?? enemies[enemy];
        enemyRegistry[id] = parseYamlToEnemy(_enemy);
    }
}