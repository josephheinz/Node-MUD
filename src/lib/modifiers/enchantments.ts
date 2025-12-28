import type { IItemModifier, IRawModifierSpec } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';
import { toRoman } from '$lib/utils/general';
import type { ReforgeGroup } from './reforges';

export class EnchantmentModifier implements IItemModifier {
	static type = 'Enchantment';
	type = 'Enchantment';
	priority = 5;

	constructor(public enchantments: Enchantment[]) {}

	modifyDescription(baseDesc: string): string {
		let base = '';

		this.enchantments.forEach((ench, index) => {
			let name: string;
			if (ench.level === 1 && ench.maxLevel === 1) name = ench.name;
			else name = `${ench.name} ${toRoman(ench.level)}`;

			if (ench.level === ench.maxLevel && ench.maxLevel !== 1)
				base += `<span style="color:orange;">${name}</span>`;
			else base += `<span style="color:var(--muted-foreground);">${name}</span>`;

			if (index === this.enchantments.length - 1) return;
			else base += ', ';
		});

		return `</br><b>Enchantments</b>: ${base}</br>${baseDesc}`;
	}

	hash(): string {
		const enchantStrings: string[] = this.enchantments.map((e) => `${e.name}:${e.level}`);
		return `${this.type}:[${enchantStrings.join(',')}]`;
	}

	toJSON(): IRawModifierSpec {
		return {
			type: this.type,
			enchantments: this.enchantments.map((e) => `${e.name}:${e.level}`)
		};
	}

	static fromHash(hash: string): EnchantmentModifier {
		const inner = hash.slice(EnchantmentModifier.type.length + 2, -1); // slice whats inside of the square brackets: "Enchantment:[...]"

		const blocks = inner.split(',');

		const enchants: Enchantment[] = blocks.map((e) => {
			const [name, level] = e.split(':');
			const baseEnchant: Enchantment = Enchantments[name];
			return {
				...baseEnchant,
				level: Number(level)
			};
		});

		return new EnchantmentModifier(enchants);
	}

	static fromJSON(raw: IRawModifierSpec): EnchantmentModifier {
		if (raw.enchants) {
			const enchants: Enchantment[] = (raw.enchants as string[]).map((e) => {
				const [name, level] = e.split(':');
				const baseEnchant: Enchantment = Enchantments[name];
				return {
					...baseEnchant,
					level: Number(level)
				};
			});

			return new EnchantmentModifier(enchants);
		}
		if (raw.enchantments) {
			const enchants: Enchantment[] = (raw.enchantments as Enchantment[]).map((e) => {
				const baseEnchant: Enchantment = Enchantments[e.name];
				return {
					...baseEnchant,
					level: Number(e.level)
				};
			});

			return new EnchantmentModifier(enchants);
		}

		throw new Error(`JSON is invalid: does not contain list of enchantments`);
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
