import type { UUID } from "node:crypto";
import 'dotenv/config';
import { getModifiedStats, type Stat } from "$lib/types/stats";
import { getEquipmentById } from "$lib/remote/equipment.remote";
import type { Equipment } from "$lib/types/item";
import { damageCalculation, defenseCalculation } from "$lib/utils/combat";
import type { CombatEntity, EntityUpdates, ICombatState } from "$lib/types/combat";


export async function combatTick(state: ICombatState): Promise<ICombatState> {
    let updates: EntityUpdates[] = [];

    state.players.forEach(async (player: CombatEntity) => {
        const playerEquipment: Equipment = await getEquipmentById(player.id);
        const baseStats: Record<string, Stat> = {
            "damage": { amount: player.stats.damage },
            "strength": { amount: player.stats.strength },
            "critChance": { amount: player.stats.critChance },
            "critDamage": { amount: player.stats.critDamage },
            "defense": { amount: player.stats.defense }
        };
        const attackStats = getModifiedStats(baseStats, playerEquipment);

        state.entities.forEach((entity: CombatEntity) => {
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
        });
    });

    return { tick: state.tick + 1, previousTick: Date.now(), entities: state.entities, players: state.players, updates };
}