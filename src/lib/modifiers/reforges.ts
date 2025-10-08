import { type IItemModifier } from "$lib/types/item";
import type { StatList } from "$lib/types/stats";

export interface IReforge {
    name: string;
    stats?: StatList;
};

export class ReforgeModifier implements IItemModifier {
    type = "Reforge";
    private reforge: IReforge;
    statChanges?: StatList | undefined;

    constructor(reforge: IReforge | string) {
        if (typeof reforge === "string") this.reforge = Reforges[reforge];
        else this.reforge = reforge;
        this.statChanges = this.reforge.stats;
    }

    modifyName(baseName: string): string {
        return `${this.reforge.name} ${baseName}`;
    }
};

export class ReforgeableModifier implements IItemModifier {
    type = "Reforgeable";

    constructor(public group: ReforgeGroup) { }
};

export const Reforges: Record<string, IReforge> = {
    Sharp: { name: "Sharp", stats: { "damage": 10 } },
    Heroic: { name: "Heroic", stats: { "damage": 20 } },
    Hardened: { name: "Hardened", stats: { "defense": 10 } }
};


export const ReforgeGroups: Record<string, IReforge[]> = {
    Sword: [Reforges.Sharp, Reforges.Heroic],
    Armor: [Reforges.Hardened]
};

export function rollReforge(group: ReforgeGroup): IReforge {
    const reforges = ReforgeGroups[group];
    const reforge = reforges[Math.floor(Math.random() * reforges.length)];
    return reforge
}

export type ReforgeGroup = keyof typeof ReforgeGroups;