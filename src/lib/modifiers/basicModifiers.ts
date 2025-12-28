import type { IItemModifier, IRawModifierSpec } from '$lib/types/item';
import { instantiateModifier, instantiateModifierFromHash } from './modifiersRegistry';
import type { ReforgeGroup } from './reforges';

export class EquippableModifier implements IItemModifier {
	type = 'Equippable';
	slot: string;
	priority = 2;

	constructor(slot: string) {
		this.slot = slot;
	}

	hash() {
		return `${this.type}:${this.slot}`;
	}

	toJSON(): IRawModifierSpec {
		return {
			type: this.type,
			slot: this.slot
		};
	}

	static fromHash(hash: string): EquippableModifier {
		const [, slot] = hash.split(':');

		return new EquippableModifier(slot);
	}

	static fromJSON(raw: IRawModifierSpec): EquippableModifier {
		return new EquippableModifier(raw.slot);
	}
}

export class StackableModifier implements IItemModifier {
	type = 'Stackable';
	priority = 3;

	amount: number; // amount of items present
	stack: number; // max amount of items in a stack

	constructor(amount: number, stack: number) {
		this.amount = amount;
		this.stack = stack;
	}

	hash(): string {
		return `${this.type}:${this.amount}:${this.stack}`;
	}

	toJSON(): IRawModifierSpec {
		return {
			type: this.type,
			stack: this.stack,
			amount: this.amount
		};
	}

	static fromHash(hash: string): StackableModifier {
		const [, amount, stack] = hash.split(':');

		return new StackableModifier(Number(amount), Number(stack));
	}

	static fromJSON(raw: IRawModifierSpec): StackableModifier {
		return new StackableModifier(Number(raw.amount), Number(raw.stack));
	}
}

export class EnhancerModifier implements IItemModifier {
	static type = 'Enhancer';
	type;
	priority = 4;

	constructor(
		public enhances: ReforgeGroup[],
		public enhancements: Array<IItemModifier>
	) {
		this.type = EnhancerModifier.type;
	}

	// i want to change the formatting on this in the future
	modifyDescription(baseDesc: string): string {
		let enhancesListString = '';
		let enhancementsListString = '';

		if (this.enhances.includes('any')) enhancesListString = 'Anything';
		else enhancesListString = this.enhances.join(',');

		enhancementsListString = this.enhancements.map((e) => e.displayName ?? e.type).join(',');

		let base: string = `Add: ${enhancementsListString} to ${enhancesListString}`;
		let enhancementsString: string = '';

		this.enhancements.forEach((e) => {
			let enhancement = instantiateModifier(e);
			if (enhancement.modifyDescription) {
				enhancementsString = enhancement.modifyDescription(enhancementsString);
			}
		});

		return `${base}${enhancementsString}<br>${baseDesc}`;
	}

	hash(): string {
		const inner = this.enhancements.map((e) => e.hash()).join('|');

		const enhances = this.enhances.join(',');

		return `Enhancer:${enhances}:[${inner}]`;
	}

	toJSON(): IRawModifierSpec {
		return {
			type: this.type,
			enhances: this.enhances,
			enhancements: this.enhancements.map((e) => e.hash())
		};
	}

	static fromHash(hash: string): EnhancerModifier {
		// Remove "Enhancer:" prefix
		const rest = hash.slice(EnhancerModifier.type.length + 1);

		// Find first occurrence of ":[" which separates enhances list from nested modifiers
		const sepIndex = rest.indexOf(':[');
		if (sepIndex === -1) throw new Error(`Invalid hash: ${hash}`);

		const enhancesRaw = rest.slice(0, sepIndex);
		const innerRaw = rest.slice(sepIndex + 2, -1); // skip ":[" and trailing "]"

		const enhances = enhancesRaw.split(',') as ReforgeGroup[];

		// Bracket-aware split for nested modifiers
		const inner: IItemModifier[] = [];
		let buffer = '';
		let depth = 0;

		for (let i = 0; i < innerRaw.length; i++) {
			const char = innerRaw[i];
			if (char === '[') depth++;
			if (char === ']') depth--;

			if (char === '|' && depth === 0) {
				const chunk = buffer.trim();
				if (typeof chunk === 'string') {
					inner.push(instantiateModifierFromHash(chunk));
				} else if (typeof chunk === 'object') {
					inner.push(chunk as IItemModifier);
				}
				buffer = '';
			} else {
				buffer += char;
			}
		}

		if (buffer) {
			const chunk = buffer.trim();
			if (typeof chunk === 'string') {
				inner.push(instantiateModifierFromHash(chunk));
			} else if (typeof chunk === 'object') inner.push(chunk as IItemModifier);
		}

		return new EnhancerModifier(enhances, inner);
	}

	static fromJSON(raw: IRawModifierSpec): EnhancerModifier {
		const enhancements: IItemModifier[] = raw.enhancements.map(instantiateModifier);
		return new EnhancerModifier(raw.enhances as ReforgeGroup[], enhancements);
	}
}
