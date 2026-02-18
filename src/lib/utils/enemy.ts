import type { ITooltipData } from "$lib/components/tooltip";
import { enemyRegistry, type Enemy } from "$lib/types/enemy";
import { Stats } from "$lib/types/stats";

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

        if (name === "maxHealth") return;
        let statThing = Stats[name];
        console.log(statThing, name);

        statString += `<span class="color:${Stats[name].color};">${Stats[name].icon} ${Stats[name].name}: ${val}</span></br>`
    })
    return {
        title: `Lv.${enemy.level} ${enemy.name}`,
        body: statString
    }
}