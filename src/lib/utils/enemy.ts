import type { ITooltipData } from "$lib/components/tooltip";
import { enemyRegistry, type Enemy } from "$lib/types/enemy";
import { normalizeXpKeys } from "$lib/types/action";

export function getEnemy(id: string): Enemy | null {
    console.log(enemyRegistry)
    if (enemyRegistry[id]) return enemyRegistry[id];
    return null;
}

export function getEnemyData(enemy: Enemy): ITooltipData {
    let statString = "";

    Object.entries(enemy.stats).forEach(([name, val]) => {
        let recordized: Record<string, number> = {};
        recordized[name] = val;

        let normalized = normalizeXpKeys(recordized)
        statString += `${normalized[name]}: ${val}</br>`
    })
    return {
        title: `Lv.${enemy.level} ${enemy.name}`,
        body: statString
    }
}