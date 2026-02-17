import { parse } from "yaml";
import type { Skill } from "./skills";
import { cumulativeXPForLevel } from "$lib/utils/skills";
import { combatActionRegistry } from "./action";

export type CombatEnemy = {
    id: string;
    amount: number;
    chance?: number;
};

export type CombatAction = {
    id: string;
    name: string;
    enemies: CombatEnemy[];
    icon: string;
    requirement?: Skill;
};

export function getCombatAction(id: string): CombatAction | null {
    if (combatActionRegistry[id]) return combatActionRegistry[id];
    return null;
}

export function parseYamlToCombatAction(yamlString: string): CombatAction {
    let action = parse(yamlString)[0];

    const enemies: CombatEnemy[] = [];
    action.enemies.forEach((e: { id: string; amount: number; chance?: number }) => {
        enemies.push({ id: e.id, amount: e.amount, chance: e.chance });
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