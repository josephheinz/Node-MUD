export type Skill = {
    name: string;
    xp: number;
};

export enum Skills {
    Mining,
    Crafting
};
export type SkillKey = keyof typeof Skills;

export const PlayerSkills: Record<SkillKey, Skill> = {
    "Mining": { name: "Mining", xp: 0 },
    "Crafting": { name: "Crafting", xp: 0 }
};