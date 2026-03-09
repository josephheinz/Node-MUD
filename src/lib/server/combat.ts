import 'dotenv/config';
import { getModifiedStats, type Stat } from "$lib/types/stats";
import { getEquipmentById } from "$lib/remote/equipment.remote";
import type { Equipment } from "$lib/types/item";
import { damageCalculation, defenseCalculation } from "$lib/utils/combat";
import type { CombatEntity, EntityUpdates, ICombatEndState, ICombatState } from "$lib/types/combat";
import { SECRET_supabase } from '$lib/auth/supabaseClient';
import { getCombatEnemy, rollEnemyDrops } from '$lib/utils/enemy';
import type { Skill, SkillKey } from '$lib/types/skills';
import { emptyXpOutput } from '$lib/utils/action';
import { clone } from 'radashi';
import { tryStackItemInInventory } from '$lib/utils/item';

export async function handleResolvedCombat(state: ICombatState): Promise<ICombatState> {
    let deadEnemies: CombatEntity[] = [];
    let deadPlayers: CombatEntity[] = [];

    state.entities.forEach((entity) => {
        if (entity.stats.health > 0) return;

        deadEnemies.push(entity);
    });

    state.players.forEach((player) => {
        if (player.stats.health > 0) return;

        deadPlayers.push(player);
    })

    if (deadPlayers.length === state.players.length) {
        state.ticking = false;
        return {
            ...state, ended: {
                message: "Combat ended: all players dead"
            }
        };
    }

    if (deadEnemies.length === state.entities.length) {
        state.ticking = false;
        const dropsRaw = state.entities.map(e => rollEnemyDrops(getCombatEnemy(e)));
        let drops = dropsRaw.flatMap(d => d.items);
        const xpArray = dropsRaw.flatMap(d => d.xp);
        let xp: Record<SkillKey, number> = clone(emptyXpOutput);
        xpArray.forEach((val) => {
            if (typeof val === 'object' && val !== null) {
                Object.entries(val).forEach(([str, value]) => {
                    const key = str as SkillKey;
                    if (!xp[key]) xp[key] = 0;
                    xp[key] += value;
                });
            }
        });

        let stackedDrops: typeof drops = [];
        drops.forEach(item => {
            const inv = tryStackItemInInventory(item, stackedDrops);
            stackedDrops = inv.contents;
        });
        return {
            ...state, ended: {
                message: "Combat ended: all enemies dead",
                drops: stackedDrops,
                xp
            }
        };
    }

    return state;
}

export async function resolveCombatUpdates(state: ICombatState): Promise<ICombatState> {
    if (!state.updates) return state;
    let updates = state.updates;

    updates.forEach((update: EntityUpdates) => {
        if (!update.action) return;

        let target = update.action.target;
        if (!target) return;

        let targetEntity = state.entities.find(e => e.id === target) ?? state.players.find(p => p.id === target);
        if (!targetEntity) return;

        if (update.action.type === "attack") {
            let damage = update.action.value ?? 0;
            targetEntity.stats.health -= damage;
            if (targetEntity.stats.health <= 0) {
                handleResolvedCombat(state).then((s) => {
                    state = s;
                    console.log(s)
                });
            }
        } else if (update.action.type === "heal") {
            let heal = update.action.value ?? 0;
            targetEntity.stats.health = Math.min(targetEntity.stats.maxHealth, targetEntity.stats.health + heal);
        } else {
            /////////////////////////////////////////
            /// special will go here eventually  ///
            ///////////////////////////////////////
        }
    });

    return state;
}

export async function combatTick(state: ICombatState): Promise<ICombatState> {
    if (state.ticking === false) return handleResolvedCombat(state);

    let updates: EntityUpdates[] = [];

    for (let i = 0; i < state.players.length; i++) {
        const player = state.players[i];
        const playerEquipment: Equipment = await getEquipmentById(player.id);
        const baseStats: Record<string, Stat> = {
            "damage": { amount: player.stats.damage },
            "strength": { amount: player.stats.strength },
            "critChance": { amount: player.stats.critChance },
            "critDamage": { amount: player.stats.critDamage },
            "defense": { amount: player.stats.defense }
        };
        const attackStats = getModifiedStats(baseStats, playerEquipment);

        for (let j = 0; j < state.entities.length; j++) {
            const entity = state.entities[j];
            const playerDamage = damageCalculation(attackStats);
            const entityDefensePercent = defenseCalculation({ defense: entity.stats.defense });

            const entityDamageTaken: number = Math.max(0, Math.round(playerDamage.damage - (playerDamage.damage * (entityDefensePercent / 100))));

            let update: EntityUpdates = {
                id: player.id,
                action: {
                    type: "attack",
                    target: entity.id,
                    value: entityDamageTaken,
                    crit: playerDamage.crit
                }
            };
            updates.push(update);

            const entityAttackStats: Record<string, Stat> = {
                "damage": { amount: entity.stats.damage },
                "strength": { amount: entity.stats.strength },
                "critChance": { amount: entity.stats.critChance },
                "critDamage": { amount: entity.stats.critDamage }
            };

            const entityDamage = damageCalculation(entityAttackStats);
            const playerDefensePercent = defenseCalculation({ defense: attackStats.defense.amount });

            const playerDamageTaken: number = Math.max(0, Math.round(entityDamage.damage - (entityDamage.damage * (playerDefensePercent / 100))));
            let entUpdate: EntityUpdates = {
                id: entity.id,
                action: {
                    type: "attack",
                    target: player.id,
                    value: playerDamageTaken,
                    crit: entityDamage.crit
                }
            };
            updates.push(entUpdate);
        }
    }

    const resolvedState = await resolveCombatUpdates({ tick: state.tick + 1, previousTick: Date.now(), entities: state.entities, players: state.players, updates, ticking: state.ticking })

    return resolvedState;
}