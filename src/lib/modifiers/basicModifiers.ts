import { type IItemModifier } from '$lib/types/item';
import { reviveModifiers } from '$lib/utils/item';
import { instantiateModifier } from './modifiersRegistry';
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
	type = 'Enhancer';

	constructor(
		public enhances: ReforgeGroup[],
		public enhancements: IItemModifier[]
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
}
