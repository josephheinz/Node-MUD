import { type IItemModifier } from "$lib/items";
import type { StatList } from "$lib/stats";

export interface IReforge {
    name: string;
    stats?: StatList;
}

export class ReforgeModifier implements IItemModifier {
    type = "Reforge";
    statChanges?: StatList | undefined;
    private reforge: IReforge;

    constructor(reforge: IReforge | string) {
        if (typeof reforge === "string") this.reforge = Reforges[reforge];
        else this.reforge = reforge;
        this.statChanges = this.reforge.stats;
    }

    modifyName(baseName: string): string {
        return `${this.reforge.name} ${baseName}`;
    }
}

export const Reforges: Record<string, IReforge> = {
    Sharp: { name: "Sharp", stats: { "attack": 10 } }
}