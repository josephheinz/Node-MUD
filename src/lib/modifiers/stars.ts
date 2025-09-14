import { type IItemModifier } from "$lib/items";

export class StarsModifier implements IItemModifier {
    type = "Stars";

    constructor(private stars: number) { }

    modifyName(baseName: string): string {
        let leftoverStars: number | null = null;
        if (this.stars > 5) leftoverStars = this.stars % 5;

        if (leftoverStars) {
            return `${baseName} ${"⍟".repeat(leftoverStars)}${"✪".repeat(5 - leftoverStars)}`
        } else {
            return `${baseName} ${"✪".repeat(this.stars)}`
        }
    }
}