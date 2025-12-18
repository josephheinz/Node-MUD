import { type IItemModifier } from "$lib/types/item";
import type { StatList } from "$lib/types/stats";

export class CaduceusModifier implements IItemModifier {
    type = "Caduceus";

    statChanges: StatList = {
        "crit damage": 50,
        "crit chance": 10,
        strength: 25,
        damage: 10
    };

    modifyName(baseName: string): string {
        return `☤ ${baseName}`;
    }
}