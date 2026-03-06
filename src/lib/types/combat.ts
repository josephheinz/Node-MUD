import type { UUID } from "node:crypto";
import type { StatList } from "./stats";
import type { EnemyStats } from "./enemy";
import type { Item } from "./item";
import type { Skill, SkillKey } from "./skills";

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
    drops?: Item[];
    xp?: Record<SkillKey, Skill>;
}