import { type IItemModifier } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';
import { toRoman } from '$lib/utils/general';
import type { ReforgeGroup } from './reforges';

export class EnchantmentModifier implements IItemModifier {
	type = 'Enchantment';

	constructor(public enchantments: Enchantment[]) {}

	modifyDescription(baseDesc: string): string {
		let base = '';

		this.enchantments.forEach((ench, index) => {
			let name: string = `${ench.name} ${toRoman(ench.level)}`;

			if (ench.level === ench.maxLevel) base += `<span style="color:orange;">${name}</span>`;
			else base += name;

			if (index === this.enchantments.length - 1) return;
			else base += ', ';
		});

		return `</br><b>Enchantments</b>: ${base}</br>${baseDesc}`;
	}
}

export const Enchantments: Record<string, Enchantment> = {};

export type Enchantment = {
	name: string;
	statChanges?: StatList;
	level: number;
	maxLevel: number;
	applies: ReforgeGroup[];
};
