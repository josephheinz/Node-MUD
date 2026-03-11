import type { UUID } from "node:crypto";
import type { StatList } from "./stats";
import type { EnemyStats } from "./enemy";
import type { DBItem, Item } from "./item";
import type { Skill, SkillKey } from "./skills";
import type { CombatEnemy } from "./combatAction";
import { getEnemy } from "$lib/utils/enemy";

export type ActionType = "attack" | "heal" | "special";

export type Effect = {
    name: string;
    duration: number;
    value?: number;
}

export interface IActionResult {
    type: ActionType;
    target: UUID;
    value?: number;
    crit?: boolean;
}

export type EntityUpdates = {
    id: UUID;
    stats?: StatList;
    effects?: string[];
    action?: IActionResult;
}

export type CombatEntity = {
    id: UUID;
    enemyId: string;
    stats: EnemyStats;
    effects?: string[];
    aiModel?: string;
}

export interface ICombatState {
    tick: number;
    previousTick: number;
    entities: CombatEntity[];
    players: CombatEntity[];
    ticking: boolean;
    updates?: EntityUpdates[];
    ended?: ICombatEndState;
};

export interface ICombatEndState {
    message: string;
    drops?: DBItem[];
    xp?: Record<SkillKey, number>;
}

export function combatEnemyToCombatEntity(enemy: CombatEnemy): CombatEntity {
    const loadEnemy = getEnemy(enemy.id)!;

    return {
        id: crypto.randomUUID(),
        enemyId: enemy.id,
        stats: loadEnemy.stats
    }
}