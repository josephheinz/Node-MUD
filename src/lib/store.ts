import { writable } from "svelte/store";
import type { Item } from "./types/item";
import { Stats, type StatList } from "./types/stats";
import type { User } from "@supabase/supabase-js";
import { deepClone } from "./utils";
import type { Equipment } from "./types/equipment";

export const user = writable<User>();
export const inventory = writable<Item[]>();
export const equipment = writable<Equipment>();
export const baseStats = writable<StatList>(deepClone<StatList>(Stats));
export const modifiedStats = writable<StatList>(deepClone<StatList>(Stats));

export const chatMessage = writable<string>("");
export const chatItemLinkTable = writable<Record<number, Item>>({});