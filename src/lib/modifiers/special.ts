import { type IItemModifier } from "$lib/items";

export class CaduceusModifier implements IItemModifier {
    type = "Caduceus";
    displayName = "Caduceus";

    modifyName(baseName: string): string {
        return `☤ ${baseName}`;
    }
}