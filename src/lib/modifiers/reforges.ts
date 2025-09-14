import { type IItemModifier } from "$lib/items";

export class SharpModifier implements IItemModifier {
    type = "Sharp";
    displayName = "Sharp";

    modifyName(baseName: string): string {
        return `Sharp ${baseName}`;
    }
}