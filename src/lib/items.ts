import { parse } from "yaml";
import { type ITooltipData } from "./components/tooltip";
import { instantiateModifier } from "./modifiers/modifiersRegistry";

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
    Common = "#bdbdbd",
    Uncommon = "#32a852",
    Rare = "#3258a8",
    Epic = "#b34ec7",
    Legendary = "#c9b216",
    Mythic = "#fc6ae2",
    Divine = "#3ad4e8"
};

export interface IItemModifier {
    type: string;
    value?: number | string | boolean;
    displayName?: string;
    modifyName?(baseName: string): string;
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
    const modifiers: IItemModifier[] = (item.modifiers || []).map(instantiateModifier)

    console.log(item);

    return {
        id: item.id,
        name: item.name,
        rarity: Rarity[item.rarity as RarityKey],
        icon: {
            ascii: item.icon.ascii,
            image: item.icon.image
        },
        modifiers
    };
}

export function GetItemData(item: Item): ITooltipData {
    let rarityName: string = GetRarity(item.rarity);
    let descriptor: string = `<b style="color:${item.rarity}">${rarityName} Item</b>`;

    let itemName: string = getDisplayName(item);

    return {
        title: itemName,
        body: `${item.id}<br>${descriptor}`
    }
}

export function GetRarity(color: string): string {
    const rarity = Object.keys(Rarity).find(k => Rarity[k as keyof typeof Rarity] === color) ?? Rarity.Common;
    return rarity;
}

export function getDisplayName(item: Item): string {
    return item.modifiers?.reduce(
        (name, mod) => mod.modifyName ? mod.modifyName(name) : name,
        item.name
    ) ?? item.name;
}