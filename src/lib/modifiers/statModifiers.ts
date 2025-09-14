import { type IItemModifier } from "$lib/items";

export class AttackModifier implements IItemModifier {
    type = "Attack";

    constructor(private attack: number) { }

    modifyDescription(baseDesc: string): string {
        return `${baseDesc}Attack: +${this.attack}\n`;
    }
}