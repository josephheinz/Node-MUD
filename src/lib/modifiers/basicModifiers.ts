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
		amount: number,
		public stack: number
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
	static type = 'Enhancer';
	type;

	constructor(
		public enhances: ReforgeGroup[],
		public enhancements: Array<IItemModifier & HashableModifier>
	) {
		this.type = EnhancerModifier.type;
	}

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
		// Remove "Enhancer:"
		const rest = hash.slice(EnhancerModifier.type.length + 1);

		// Split enhances vs inner block safely
		const bracketIndex = rest.indexOf(':[');
		if (bracketIndex === -1) throw new Error('Invalid Enhancer hash');

		const enhancesRaw = rest.slice(0, bracketIndex);
		const innerRaw = rest.slice(bracketIndex + 2, -1); // remove :[ and trailing ]

		const enhances = enhancesRaw.split(',') as ReforgeGroup[];

		// Split inner modifiers SAFELY
		const inner: (IItemModifier & HashableModifier)[] = [];
		let depth = 0;
		let buffer = '';

		for (const char of innerRaw) {
			if (char === '[') depth++;
			if (char === ']') depth--;

			if (char === '|' && depth === 0) {
				inner.push(instantiateModifierFromHash(buffer));
				buffer = '';
			} else {
				buffer += char;
			}
		}

		if (buffer) inner.push(instantiateModifierFromHash(buffer));

		return new EnhancerModifier(enhances, inner);
	}
}
