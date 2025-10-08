import { type IItemModifier } from "$lib/types/item";

export class CaduceusModifier implements IItemModifier {
    type = "Caduceus";
    displayName = "Caduceus";

    modifyName(baseName: string): string {
        return `☤ ${baseName}`;
    }
}