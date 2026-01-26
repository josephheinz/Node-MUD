import type { Transport } from '@sveltejs/kit';
import { Equipment, Inventory, type DBEquipment } from '$lib/types/item';
import { encodeDBItem, loadDbItem } from '$lib/utils/item';

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
			if (!(value && value.__itemBrand)) return; // safe decline
			return encodeDBItem(value);
		},
		decode: loadDbItem
	},
	Inventory: {
		encode: (value) => {
			if (!(value instanceof Inventory)) return false;
			return value.serialize();
		},
		decode: (data) => {
			return Inventory.load(data);
		}
	}
};
