import type Equipment from "./components/equipment.svelte";
import type { Item } from "./items";

export const user = $state(undefined);

export const inventory: Item[] = $state([]);

export const equipment: Equipment | undefined = $state(undefined);