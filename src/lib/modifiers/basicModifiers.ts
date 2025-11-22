import { type IItemModifier } from "$lib/types/item";

export class EquippableModifier implements IItemModifier {
    type = "Equippable";
    value;

    constructor(slot: string) {
        this.value = slot;
    }
}

export class StackableModifier implements IItemModifier {
    type = "Stackable";
    value;

    constructor(amount: number, public stack: number) {
        this.value = amount;
    }
}