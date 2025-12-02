import { writable } from "svelte/store";
import type { Item } from "./types/item";
import { Stats, type StatList } from "./types/stats";
import type { User } from "@supabase/supabase-js";
import type { Equipment } from "./types/equipment";
import { deepClone } from "./utils/general";
import type { Action } from "./types/action";

export const user = writable<User>();
export const inventory = writable<Item[]>();
export const equipment = writable<Equipment>();
export const baseStats = writable<StatList>(deepClone<StatList>(Stats));
export const modifiedStats = writable<StatList>(deepClone<StatList>(Stats));
export const actionQueue = writable<{
    action: Action;
    amount: number;
}[]>([]);

export const queueStart = writable<number | null>();
export const queueEnd = writable<number | null>();
export const queueActive = writable<boolean>(false);

export const chatMessage = writable<string>("");
export const chatItemLinkTable = writable<Record<number, Item>>({});

export const actionModalData = writable<{ action: string; visible: boolean; amount: number }>({ action: "", visible: false, amount: 1 });