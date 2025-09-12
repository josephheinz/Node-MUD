import type { Item } from "./items";
import { type Equipment, EmptyEquipment } from "./types";

export const user = $state(undefined);

export const inventory: Item[] = $state([]);

export const equipment: Equipment = $state(EmptyEquipment);