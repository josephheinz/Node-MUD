import { parse } from "yaml";
import type { Skill } from "./skills";
import { enemyRegistry, initializeEnemyRegistry, type Enemy } from "./enemy";
import { cloneDeep } from "radashi";
import { cumulativeXPForLevel } from "$lib/utils/skills";

export type CombatEnemy = {
    id: string;
    amount: number;
    chance?: number;
};

export type CombatAction = {
    id: string;
    name: string;
    enemies: Set<CombatEnemy>;
    icon: string;
    requirement?: Skill;
};

export function parseYamlToCombatAction(yamlString: string): CombatAction {
    let action = parse(yamlString)[0];

    const enemies: Set<CombatEnemy> = new Set();
    action.enemies.forEach((id: string, amount: number, chance: number | undefined) => {
        enemies.add({ id, amount, chance });
    });

    const requirement = action.req
        ? {
            name: action.req.skill,
            xp: cumulativeXPForLevel(action.req.level)
        }
        : undefined;

    return {
        id: action.id,
        name: action.name,
        enemies,
        icon: action.icon,
        requirement
    };
}