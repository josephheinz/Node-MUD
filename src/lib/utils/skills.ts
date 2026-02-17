import { Skills, type Skill } from "$lib/types/skills";

export function xpForLevel(level: number): number {
    // Tunable constants:
    const a = 2;        // linear coeff (early)
    const b = 4;         // quadratic coeff (mid)
    const c = 40;        // baseline offset
    const mid = 60;      // midpoint where exponential begins to take over
    const k = 0.15;      // logistic steepness (how fast blend happens)
    const f = 50_000;     // exponential base amplitude (late-game scale)
    const g = 1.1;      // exponential growth factor (late-game slope)

    // logistic blend (0 -> use polynomial, 1 -> use exponential)
    const s = 1 / (1 + Math.exp(-k * (level - mid)));

    // polynomial part (early + mid)
    const poly = a * level + b * level * level + c;

    // exponential late-game part (only grows after `mid`)
    const expTerm = f * Math.pow(g, Math.max(0, level - mid));

    const val = (1 - s) * poly + s * expTerm;
    return Math.round(val);
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
        table[lvl] = cumulative;
    }
    return table;
}

export function cumulativeXPForLevel(level: number): number {
    return XP_TABLE[Math.max(0, level - 1)];
}

export function fillMissingSkills(
    input: Partial<Record<Skills, Skill>>
): Record<Skills, Skill> {
    const result = {} as Record<Skills, Skill>;

    for (const skill of Object.values(Skills)) {
        result[skill] = input[skill] ?? {
            name: skill,
            xp: 0
        };
    }

    return result;
}


export const XP_TABLE = buildXPTable(120);
