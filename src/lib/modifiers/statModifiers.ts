import { type IItemModifier } from "$lib/items";

export class AttackModifier implements IItemModifier {
    type = "Attack";
    value;

    constructor(attack: number) {
        this.value = attack;
    }

    modifyDescription(baseDesc: string): string {
        return `${baseDesc}Attack: +${this.value}\n`;
    }
}

export class DefenseModifier implements IItemModifier {
    type = "Defense";
    value;

    constructor(defense: number) {
        this.value = defense;
    }

    modifyDescription(baseDesc: string): string {
        return `${baseDesc}Defense: +${this.value}\n`;
    }
}