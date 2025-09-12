import type { Item } from "./items";

export type EquipmentSlot = keyof Equipment;

export type Equipment = {
    head: Item | undefined;
    body: Item | undefined;
    legs: Item | undefined;
    offhand: Item | undefined;
    mainhand: Item | undefined;
};

export const EmptyEquipment: Equipment = {
    head: undefined,
    body: undefined,
    legs: undefined,
    offhand: undefined,
    mainhand: undefined
};

export function Equip(equipment: Equipment, item: Item): boolean {
    item.modifiers.forEach((mod) => {
        if (mod.type !== "Equip Modifier" || !mod.value || typeof mod.value !== "string") return;
        if (equipment[mod.value as keyof Equipment] != undefined) return;

        try {
            equipment[mod.value as EquipmentSlot] = item;
            return;
        } catch (err) {
            throw new Error(`${err}`);
        }
    });

    return true;
}