import { writable } from "svelte/store";
import type { Item } from "./items";
import { deepClone, type Equipment, type User } from "./types";
import { Stats, type StatList } from "./stats";

export const user = writable<User>();
export const inventory = writable<Item[]>();
export const equipment = writable<Equipment>();
export const baseStats = writable<StatList>(deepClone<StatList>(Stats));
export const modifiedStats = writable<StatList>(deepClone<StatList>(Stats));