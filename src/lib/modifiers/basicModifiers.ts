import { type IItemModifier } from '$lib/types/item';
import type { ReforgeGroup } from './reforges';

export class EquippableModifier implements IItemModifier {
	type = 'Equippable';
	value;

	constructor(slot: string) {
		this.value = slot;
	}
}

export class StackableModifier implements IItemModifier {
	type = 'Stackable';
	value;

	constructor(
		public stack: number,
		amount: number
	) {
		this.value = amount;
	}
}

export class EnhancerModifier implements IItemModifier {
	type = "Enhancer";

	constructor(
		public enhances: ReforgeGroup[],
		public enhancements: IItemModifier[]
	) { }
}