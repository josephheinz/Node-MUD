import type { ITooltipData } from "$lib/components/tooltip";
import type { ChanceItem } from "$lib/types/action";
import { enemyRegistry, initializeEnemyRegistry, type Enemy, type EnemyDrops, type EnemyStats } from "$lib/types/enemy";
import type { Item } from "$lib/types/item";
import type { Skill, SkillKey } from "$lib/types/skills";
import { Stats, type StatList } from "$lib/types/stats";
import type { UUID } from "node:crypto";
import { cloneDeep } from "radashi";
import { emptyXpOutput, rollChance, rollValue } from "./action";
import { getItem } from "./item";
import { safeCloneDeep } from "./general";

export function getEnemy(id: string): Enemy | null {
    if (enemyRegistry[id]) return enemyRegistry[id];
    return null;
}

export function getEnemyData(enemy: Enemy): ITooltipData {
    let statString = "";

    Object.entries(enemy.stats).forEach(([name, val]) => {
        let recordized: Record<string, number> = {};
        recordized[name] = val;

        if (name === "maxHealth") return;

        statString += `<span class="color:${Stats[name].color};">${Stats[name].icon} ${Stats[name].name}: ${val}</span></br>`
    })
    return {
        title: `Lv.${enemy.level} ${enemy.name}`,
        body: statString
    }
}

export function getCombatEnemy(enemy: {
    id: UUID;
    enemyId: string;
    stats: EnemyStats;
    effects?: string[];
    aiModel?: string;
}): Enemy {
    let regEnemy = getEnemy(enemy.enemyId)!
    let cloned = cloneDeep(regEnemy)

    cloned.stats = { ...enemy.stats, maxHealth: regEnemy.stats.maxHealth };

    return cloned;
}

export function rollEnemyDrops(enemy: Enemy): { items: Item[]; xp: Record<SkillKey, number>; } {
    let items: Item[] = [];
    let xp: Record<SkillKey, number> = { ...emptyXpOutput };

    enemy.drops.forEach((drop: EnemyDrops) => {
        drop.items.forEach((item: ChanceItem) => {
            const loadedItem: Item | null = getItem(item.id);
            if (!loadedItem) return;

            if (!rollChance(item)) return;

            for (let i = 0; i < rollValue(item); i++)
                items.push(safeCloneDeep(loadedItem))
        });

        if (drop.xp === undefined || drop.xp === null) return;

        Object.keys(drop.xp).forEach((val: string) => {
            const key = val as SkillKey
            xp[key] += drop.xp![key] ?? 0;
        });
    });

    return { items, xp };
}