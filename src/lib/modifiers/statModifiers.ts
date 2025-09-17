import { type IItemModifier } from "$lib/items";

export class AttackModifier implements IItemModifier {
    type = "Attack";
    value;

    constructor(private attack: number) {
        this.value = attack;
    }

    modifyDescription(baseDesc: string): string {
        return `${baseDesc}Attack: +${this.value}\n`;
    }
}