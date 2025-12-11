export type Skill = {
	name: string;
	xp: number;
};

export enum Skills {
	Mining,
	Crafting
}
export type SkillKey = keyof typeof Skills;

export const PlayerSkills: Record<SkillKey, Skill> = {
	Mining: { name: 'Mining', xp: 0 },
	Crafting: { name: 'Crafting', xp: 0 }
};

export function xpForLevel(level: number): number {
	return 90 * level * level + 250 * level + 1000 + 120 * Math.pow(1.055, level);
}

export function xpToLevel(xp: number): number {
	for (let lvl = 1; lvl < XP_TABLE.length; lvl++) {
		if (xp < XP_TABLE[lvl]) return lvl;
	}
	return XP_TABLE.length - 1;
}

function buildXPTable(maxLevel = 120): Array<number> {
	const table = [0];
	let cumulative = 0;

	for (let lvl = 1; lvl <= maxLevel; lvl++) {
		cumulative += xpForLevel(lvl);
		table[lvl] = Math.round(cumulative);
	}
	return table;
}

export function cumulativeXPForLevel(level: number): number {
	return XP_TABLE[Math.max(0, level - 1)];
}

export const XP_TABLE = buildXPTable(120);