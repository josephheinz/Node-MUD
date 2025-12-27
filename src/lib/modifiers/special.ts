import type { IItemModifier, IRawModifierSpec } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';

export class CaduceusModifier implements IItemModifier {
	type = 'Caduceus';
	priority = 999;

	statChanges: StatList = {
		'crit damage': 50,
		'crit chance': 10,
		strength: 25,
		damage: 10
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
