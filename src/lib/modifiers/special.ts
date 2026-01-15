import type { IItemModifier, IRawModifierSpec } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';

export class CaduceusModifier implements IItemModifier {
	type = 'Caduceus';
	priority = 999;

	statChanges: StatList = {
		'crit damage': { amount: 50, operation: "additive" },
		'crit chance': { amount: 10, operation: "additive" },
		strength: { amount: 25, operation: "additive" },
		damage: { amount: 1.2, operation: "multiplicative" }
	};

	modifyName(baseName: string): string {
		return `<i class="fa-solid fa-staff-snake"></i> ${baseName}`;
	}

	hash(): string {
		return `${this.type}`;
	}

	toJSON(): IRawModifierSpec {
		return {
			type: this.type
		};
	}

	static fromHash(hash: string): CaduceusModifier {
		return new CaduceusModifier();
	}

	static fromJSON(raw: IRawModifierSpec): CaduceusModifier {
		return new CaduceusModifier();
	}
}
