import type { UUID } from "node:crypto";
import type { StatList } from "./stats";
import type { EnemyStats } from "./enemy";

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
    updates?: EntityUpdates[];
};