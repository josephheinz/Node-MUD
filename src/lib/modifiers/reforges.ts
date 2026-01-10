import type { IItemModifier, IRawModifierSpec } from '$lib/types/item';
import type { StatList } from '$lib/types/stats';

export interface IReforge {
	name: string;
	stats: StatList;
}

export class ReforgeModifier implements IItemModifier {
	type = 'Reforge';
	private _reforge: IReforge;
	statChanges: StatList;
	displayName?: string | undefined;
	priority = 1;

	constructor(reforge: IReforge | string) {
		if (typeof reforge === 'string') this._reforge = Reforges[reforge];
		else this._reforge = Reforges[reforge.name];
		this.statChanges = this._reforge.stats;
		this.displayName = `${this._reforge.name} Reforge`;
	}

	modifyName(baseName: string): string {
		return `${this._reforge.name} ${baseName}`;
	}

	get reforge(): IReforge {
		return this._reforge;
	}

	toJSON(): IRawModifierSpec {
		return {
			type: this.type,
			reforge: this._reforge,
			statChanges: this.statChanges
		};
	}

	static fromJSON(raw: IRawModifierSpec): ReforgeModifier {
		return new ReforgeModifier(raw.reforge ?? raw._reforge);
	}

	hash(): string {
		return `${this.type}:${this._reforge.name}`;
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

	toJSON(): IRawModifierSpec {
		return {
			type: this.type,
			group: this.group
		};
	}

	static fromHash(hash: string): ReforgeableModifier {
		const [, group] = hash.split(':');
		return new ReforgeableModifier(group as ReforgeGroup);
	}

	static fromJSON(raw: IRawModifierSpec): ReforgeableModifier {
		return new ReforgeableModifier(raw.group);
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
