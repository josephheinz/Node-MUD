import { parse } from "yaml";
import { type ITooltipData } from "../components/tooltip";
import { instantiateModifier } from "../modifiers/modifiersRegistry";
import type { StatList } from "./stats";
import { type EquipmentSlot } from "./equipment";
import { determineSlot } from "$lib/utils/item";
import { capitalizeFirstLetter, formatNumber } from "$lib/utils/general";
import type { ReforgeableModifier } from "$lib/modifiers/reforges";
import type { StackableModifier } from "$lib/modifiers/basicModifiers";
import numeral from "numeral";

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
    toJSON?: () => object;
    fromJSON?: (json: any) => IItemModifier;
}

export interface DBItem {
    id: string;
    modifiers?: IItemModifier[];
}

export type Item = {
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

/**
 * Builds tooltip data for an item including title and a formatted body with stats, description, rarity, and optional slot/stack info.
 *
 * @param item - The item to render into tooltip data
 * @param equippable - If true, includes the equipment slot line when the item is equippable
 * @returns An ITooltipData object whose `title` is the item's display name and whose `body` contains (in order) stack information if present, an optional slot line, formatted stat lines showing base/modifier/reforge values, the item description, and a colored rarity descriptor
 */
export function getItemData(item: Item, equippable: boolean = true): ITooltipData {
    let rarityName: string = getRarity(item.rarity);
    let reforgeGroup: ReforgeableModifier | undefined = item.modifiers.find(m => m.type === "Reforgeable") as ReforgeableModifier;
    let descriptor: string = `<b style="color:${item.rarity}">${rarityName} ${reforgeGroup ? reforgeGroup.group : "Item"}</b>`;

    let itemName: string = getDisplayName(item);
    let itemDesc: string = getDisplayDescription(item);

    let slot: EquipmentSlot | undefined = determineSlot(item);
    let equipMsg: string = "";
    if (slot && equippable) equipMsg = `Slot: ${slot}<br/>`;

    let stats = computeItemStats(item);
    let statsString = "";

    const stackableModifier: StackableModifier | undefined = item.modifiers.find(
        (m) => m.type == 'Stackable'
    ) as StackableModifier;
    let stackString = "";

    if (stackableModifier != undefined) {
        stackString = `Stack: ${formatNumber(stackableModifier.value)} / ${formatNumber(stackableModifier.stack)}</br>`;
    }

    for (const key in stats) {
        const s = stats[key];
        if (s.base || s.modifiers > 0 || s.reforges > 0) {
            statsString += `${capitalizeFirstLetter(key)}: ${s.base}<span style="color:oklch(74.6% 0.16 232.661);">${s.modifiers > 0 ? ` (+${s.modifiers})` : ""}</span><span style="color:oklch(90.5% 0.182 98.111);">${s.reforges > 0 ? ` (+${s.reforges})` : ""}</span><br/>`;
        }
    }

    return {
        title: itemName,
        body: `${stackString}${equipMsg}${statsString}${itemDesc}<br/>${descriptor}`
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

/**
 * Produce the item's final description after applying each modifier's description hook in order.
 *
 * @param item - The item whose description will be produced
 * @returns The final description string with each modifier's `modifyDescription` applied sequentially
 */
export function getDisplayDescription(item: Item): string {
    const base = item.desc ?? "";
    return item.modifiers?.reduce(
        (desc, mod) => mod.modifyDescription ? mod.modifyDescription(desc) : desc,
        base
    ) ?? base;
}

/**
 * Retrieve an item by its registry id.
 *
 * @param id - The item's identifier in the registry
 * @returns The matching Item if found, `null` otherwise
 */
export function getItem(id: string): Item | null {
    if (itemRegistry[id]) return itemRegistry[id];
    return null;
}

// Load all the items for api

export const itemRegistry: Record<string, Item> = {};

const items = import.meta.glob("$lib/items/**/*", { eager: true, as: "raw" });

for (const item in items) {
    const id = item.split("/").pop()!.replace(/\.[^/.]+$/, '');
    let _item = (items[item] as any).default ?? items[item];
    itemRegistry[id] = parseYAMLToItem(_item);
}