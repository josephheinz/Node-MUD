import { type HashableModifier, type IItemModifier } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';

export class CaduceusModifier implements IItemModifier, HashableModifier {
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

	static fromHash(hash: string): CaduceusModifier {
		return new CaduceusModifier();
	}
}
