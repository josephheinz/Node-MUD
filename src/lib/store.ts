import { writable } from "svelte/store";
import type { Item } from "./items";
import { type Equipment, type User } from "./types";

export const user = writable<User>();
export const inventory = writable<Item[]>();
export const equipment = writable<Equipment>();