import { type IItemModifier } from "$lib/types/item";

export class EquippableModifier implements IItemModifier {
    type = "Equippable";
    value;

    constructor(slot: string) {
        this.value = slot;
    }
}