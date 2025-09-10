import { parse } from "yaml";

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
    Common = "gray",
    Uncommon = "lime",
    Rare = "blue",
    Epic = "purple",
    Legendary = "gold",
    Mythic = "pink",
    Divine = "cyan"
};

export interface IItemModifier {
    name: string;
    value?: number | string | boolean;
}

export interface Item {
    id: string;
    name: string;
    rarity: Rarity;
    icon: {
        ascii: string;
        image?: string;
    };
    modifiers?: IItemModifier[];
}

export function ParseYAMLToItem(yamlString: string): Item {
    let item = parse(yamlString)[0];

    console.log(item);

    return {
        id: item.id,
        name: item.name,
        rarity: Rarity[item.rarity as RarityKey],
        icon: {
            ascii: item.icon.ascii,
            image: item.icon.image
        },
        modifiers: item.modifiers
    };
}