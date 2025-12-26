import { type HashableModifier, type IItemModifier } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';

export interface IReforge {
	name: string;
	stats?: StatList;
}

export class ReforgeModifier implements IItemModifier, HashableModifier {
	type = 'Reforge';
	public reforge: IReforge;
	statChanges?: StatList;
	displayName?: string | undefined;
	priority = 1;

	constructor(reforge: IReforge | string) {
		if (typeof reforge === 'string') this.reforge = Reforges[reforge];
		else this.reforge = reforge;
		this.statChanges = this.reforge.stats;
		this.displayName = `${this.reforge.name} Reforge`;
	}

	modifyName(baseName: string): string {
		return `${this.reforge.name} ${baseName}`;
	}

	toJSON() {
		return {
			type: this.type,
			reforge: this.reforge.name,
			statChanges: this.statChanges
		};
	}

	static fromJSON(json: any) {
		return new ReforgeModifier(json.reforge);
	}

	hash(): string {
		return `${this.type}:${this.reforge.name}`;
	}

	static fromHash(hash: string): ReforgeModifier {
		const [, name] = hash.split(':');
		return new ReforgeModifier(name);
	}
}

export class ReforgeableModifier implements IItemModifier {
	type = 'Reforgeable';
	public group: ReforgeGroup;
	readonly priority = 999;

	constructor(group: ReforgeGroup) {
		this.group = group;
	}

	modifyDescription(baseDesc: string): string {
		return `<span class="color:#333;">This item can be reforged</span></br>${baseDesc}`;
	}

	hash(): string {
		return `${this.type}:${this.group}`;
	}

	static fromHash(hash: string): ReforgeableModifier {
		const [, group] = hash.split(':');
		return new ReforgeableModifier(group as ReforgeGroup);
	}
}

export const Reforges: Record<string, IReforge> = {
	Sharp: { name: 'Sharp', stats: { damage: 10 } },
	Heroic: { name: 'Heroic', stats: { damage: 20 } },
	Hardened: { name: 'Hardened', stats: { defense: 10 } },
	Crystalized: { name: 'Crystalized', stats: { damage: 20, defense: 20 } }
};

export const ReforgeGroups: Record<string, IReforge[]> = {
	Sword: [Reforges.Sharp, Reforges.Heroic],
	Armor: [Reforges.Hardened],
	Jewelry: []
};

export function rollReforge(group: ReforgeGroup): IReforge {
	const reforges = ReforgeGroups[group];
	const reforge = reforges[Math.floor(Math.random() * reforges.length)];
	return reforge;
}

export type ReforgeGroup = keyof typeof ReforgeGroups;
