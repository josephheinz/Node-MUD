import { parse } from "yaml";
import { type ITooltipData } from "../components/tooltip";
import { instantiateModifier } from "../modifiers/modifiersRegistry";
import type { StatList } from "./stats";
import { capitalizeFirstLetter, determineSlot } from "../utils";
import { type EquipmentSlot } from "./equipment";

export type RarityKey = keyof typeof Rarity;

export enum Rarity {
    Common = "#bdbdbd",
    Uncommon = "#32a852",
    Rare = "#5b8dfa",
    Epic = "#d335f3",
    Legendary = "#dbd82b",
    Mythic = "#fd89e8",
    Divine = "#3fe9ff",
    Special = "#ff5252"
};

export interface IItemModifier {
    type: string;
    value?: number | string | boolean;
    displayName?: string;
    modifyName?(baseName: string): string;
    modifyDescription?(baseDesc: string): string;
    statChanges?: StatList;
}

export interface DBItem {
    id: string;
    modifiers?: IItemModifier[];
}

export interface Item {
    uid: string;
    id: string;
    name: string;
    rarity: Rarity;
    desc?: string;
    icon: {
        ascii: string;
        image?: string;
    };
    modifiers: IItemModifier[];
    baseStats: StatList;
}

export function parseYAMLToItem(yamlString: string): Item {
    let item = parse(yamlString)[0];
    const modifiers: IItemModifier[] = (item.modifiers || []).map(instantiateModifier)

    return {
        uid: crypto.randomUUID(),
        id: item.id,
        name: item.name,
        rarity: Rarity[item.rarity as RarityKey],
        icon: {
            ascii: item.icon.ascii,
            image: item.icon.image
        },
        modifiers,
        baseStats: item.stats
    };
}

export function computeItemStats(item: Item): Record<string, { base: number; modifiers: number; reforges: number }> {
    const stats: Record<string, { base: number; modifiers: number; reforges: number }> = {};

    const baseStats = item.baseStats ?? {};
    const modifiers = item.modifiers ?? [];

    // collect all stat keys from baseStats and all modifiers/reforges
    const statKeys = new Set<string>([
        ...Object.keys(baseStats),
        ...modifiers.flatMap(mod => mod.statChanges ? Object.keys(mod.statChanges) : [])
    ]);

    for (const key of statKeys) {
        const base = baseStats[key] ?? 0;

        let modTotal = 0;
        let reforgeTotal = 0;

        for (const mod of modifiers) {
            if (!mod.statChanges) continue;
            const val = mod.statChanges[key] ?? 0;
            if (mod.type === "Reforge") reforgeTotal += val;
            else modTotal += val;
        }

        stats[key] = { base, modifiers: modTotal, reforges: reforgeTotal };
    }

    return stats;
}

export function getItemData(item: Item, equippable: boolean = true): ITooltipData {
    let rarityName: string = getRarity(item.rarity);
    let descriptor: string = `<b style="color:${item.rarity}">${rarityName} Item</b>`;

    let itemName: string = getDisplayName(item);
    let itemDesc: string = getDisplayDescription(item);

    let slot: EquipmentSlot | undefined = determineSlot(item);
    let equipMsg: string = "";
    if (slot && equippable) equipMsg = `[Equip - Double-click]<br/>Slot: ${slot}<br/>`;

    let stats = computeItemStats(item);
    let statsString = "";

    for (const key in stats) {
        const s = stats[key];
        if (s.base || s.modifiers > 0 || s.reforges > 0) {
            statsString += `${capitalizeFirstLetter(key)}: ${s.base}<span style="color:oklch(74.6% 0.16 232.661);">${s.modifiers > 0 ? ` (+${s.modifiers})` : ""}</span><span style="color:oklch(90.5% 0.182 98.111);">${s.reforges > 0 ? ` (+${s.reforges})` : ""}</span><br/>`;
        }
    }

    return {
        title: itemName,
        body: `${equipMsg}${statsString}${itemDesc}<br/>${descriptor}`
    }
}

export function getRarity(color: string): string {
    const rarity = Object.keys(Rarity).find(k => Rarity[k as keyof typeof Rarity] === color) ?? Rarity.Common;
    return rarity;
}

export function getDisplayName(item: Item): string {
    let name = item.name;
    for (const mod of item.modifiers ?? []) {
        if (mod.modifyName) name = mod.modifyName(name);
    }
    return name;
}

export function getDisplayDescription(item: Item): string {
    const base = item.desc ?? "";
    return item.modifiers?.reduce(
        (desc, mod) => mod.modifyDescription ? mod.modifyDescription(desc) : desc,
        base
    ) ?? base;
}

// Load all the items for api

export const itemRegistry: Record<string, Item> = {};

// Update the glob path to match your actual items directory
const items = import.meta.glob("$lib/items/*", { eager: true, as: "raw" });

for (const item in items) {
    const id = item.split("/").pop()!.replace(/\.[^/.]+$/, '');
    let _item = (items[item] as any).default ?? items[item];
    itemRegistry[id] = parseYAMLToItem(_item);
}