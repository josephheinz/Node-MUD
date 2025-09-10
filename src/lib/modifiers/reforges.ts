import { type IItemModifier } from "$lib/items";

export class SharpModifier implements IItemModifier {
    type = "Sharp Reforge";
    displayName = "Sharp";

    modifyName(baseName: string): string {
        return `Sharp ${baseName}`;
    }
}