import type { Transport } from "@sveltejs/kit";
import { Equipment } from "$lib/types/item";
import { encodeDBItem, loadDbItem } from "$lib/utils/item";

export const transport: Transport = {
    Equipment: {
        encode: (value) => {
            if (!(value instanceof Equipment)) return false;
            return value.serialize();
        },
        decode: (data) => {
            return Equipment.load(data);
        }
    },

    Item: {
        encode: (value) => {
            if (!value.uid) return false;
            return encodeDBItem(value);
        },
        decode: (data) => {
            return loadDbItem(data);
        }
    }
}