import { writable } from "svelte/store";
import type { Item } from "./items";
import { type Equipment, type User } from "./types";
import { Stats, type StatList } from "./stats";

export const user = writable<User>();
export const inventory = writable<Item[]>();
export const equipment = writable<Equipment>();
export const baseStats = writable<StatList>();
export const modifiedStats = writable<StatList>(Stats);