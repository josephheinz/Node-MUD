export type Skill = {
    name: string;
    xp: number;
};

export enum Skills {
    Mining,
    Crafting,
    Combat
}
export type SkillKey = keyof typeof Skills;

export const PlayerSkills: Record<SkillKey, Skill> = {
    Mining: { name: 'Mining', xp: 0 },
    Crafting: { name: 'Crafting', xp: 0 },
    Combat: { name: "Combat", xp: 0 }
};