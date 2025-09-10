import { type IItemModifier } from "$lib/items";

export class CaduceusModifier implements IItemModifier {
    type = "Caduceus Reforge";
    displayName = "Caduceus";

    modifyName(baseName: string): string {
        return `☤ ${baseName}`;
    }
}