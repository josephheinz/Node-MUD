import { isHashableModifier, type HashableModifier, type IItemModifier } from '$lib/types/item';
import { reviveModifiers } from '$lib/utils/item';
import { instantiateModifier, instantiateModifierFromHash } from './modifiersRegistry';
import type { ReforgeGroup } from './reforges';

export class EquippableModifier implements IItemModifier, HashableModifier {
	type = 'Equippable';
	value;

	constructor(slot: string) {
		this.value = slot;
	}

	hash() {
		return `${this.type}:${this.value}`;
	}

	static fromHash(hash: string): EquippableModifier {
		const [, slot] = hash.split(':');

		return new EquippableModifier(slot);
	}
}

export class StackableModifier implements IItemModifier, HashableModifier {
	type = 'Stackable';
	value;

	constructor(
		public stack: number,
		amount: number
	) {
		this.value = amount;
	}

	hash(): string {
		return `${this.type}:${this.value}:${this.stack}`;
	}

	static fromHash(hash: string): StackableModifier {
		const [, amount, stack] = hash.split(':');

		return new StackableModifier(Number(amount), Number(stack));
	}
}

export class EnhancerModifier implements IItemModifier, HashableModifier {
	type = 'Enhancer';

	constructor(
		public enhances: ReforgeGroup[],
		public enhancements: Array<IItemModifier & HashableModifier>
	) {}

	modifyDescription(baseDesc: string): string {
		let enhancesListString = '';
		let enhancementsListString = '';

		const revivedEnhancements = reviveModifiers(this.enhancements);

		if (this.enhances.includes('any')) enhancesListString = 'Anything';
		else {
			this.enhances.forEach((e, index) => {
				enhancesListString += e;
				if (index != this.enhances.length - 1) enhancesListString += ', ';
			});
		}

		revivedEnhancements.forEach((e, index) => {
			enhancementsListString += e.displayName ?? e.type;
			if (index != revivedEnhancements.length - 1) enhancementsListString += ', ';
		});

		let base: string = `Adds: ${enhancementsListString} to ${enhancesListString}`;
		let enhancementsString: string = '';

		this.enhancements.forEach((e) => {
			let enhancement = instantiateModifier(e);
			if (enhancement.modifyDescription) {
				enhancementsString = enhancement.modifyDescription(enhancementsString);
			}
		});

		return `${base}${enhancementsString}${baseDesc}`;
	}

	hash(): string {
		const inner = this.enhancements.map((e) => e.hash()).join('|');

		const enhances = this.enhances.join(',');

		return `Enhancer:${enhances}:[${inner}]`;
	}

	static fromHash(hash: string): EnhancerModifier {
		// Enhancer:sword,armor:[Stars:3|Enchantment:Sharp:2]
		const [, rest] = hash.split(':');
		const [enhancesRaw, innerRaw] = rest.split(':[');
		const enhances = enhancesRaw.split(',') as ReforgeGroup[];

		const inner = innerRaw
			.slice(0, -1)
			.split('|')
			.map((h) => instantiateModifierFromHash(h));

		return new EnhancerModifier(enhances, inner);
	}
}
