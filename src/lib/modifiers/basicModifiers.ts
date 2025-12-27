import type { IItemModifier, IRawModifierSpec } from '$lib/types/item';

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
