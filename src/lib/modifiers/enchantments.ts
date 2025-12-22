import { type HashableModifier, type IItemModifier } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';
import { toRoman } from '$lib/utils/general';
import type { ReforgeGroup } from './reforges';

export class EnchantmentModifier implements IItemModifier, HashableModifier {
	type = 'Enchantment';

	constructor(public enchantments: Enchantment[]) {}

	modifyDescription(baseDesc: string): string {
		let base = '';

		this.enchantments.forEach((ench, index) => {
			let name: string;
			if (ench.level === 1 && ench.maxLevel === 1) name = ench.name;
			else name = `${ench.name} ${toRoman(ench.level)}`;

			if (ench.level === ench.maxLevel && ench.maxLevel !== 1)
				base += `<span style="color:orange;">${name}</span>`;
			else base += name;

			if (index === this.enchantments.length - 1) return;
			else base += ', ';
		});

		return `</br><b>Enchantments</b>: ${base}</br>${baseDesc}`;
	}

	hash(): string {
		return `${this.type}:[${this.enchantments
			.map((e) => `${e.name}:${e.level}:${e.maxLevel}:${e.applies.join(',')}`)
			.join(',')}]`;
	}

	static fromHash(hash: string): EnchantmentModifier {
		const json = JSON.parse(hash.slice(hash.indexOf(':[') + 1, -1));
		const enchants = json.map((e: any) => ({
			name: e.name,
			level: e.level,
			maxLevel: e.maxLevel,
			applies: e.applies
		}));
		return new EnchantmentModifier(enchants);
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
