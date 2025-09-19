import type { IItemModifier } from '$lib/items';
import { ReforgeModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { AttackModifier, DefenseModifier } from './statModifiers';
import { EquippableModifier } from './basicModifiers';

export const modifierRegistry: Record<string, { new(...args: any[]): IItemModifier; type?: string }> = {
    Stars: StarsModifier,
    Caduceus: CaduceusModifier,
    Attack: AttackModifier,
    Defense: DefenseModifier,
    Equippable: EquippableModifier,
    Reforge: ReforgeModifier,
};

export function instantiateModifier(modYaml: any): IItemModifier {
    const ModClass = modifierRegistry[modYaml.type];
    if (!ModClass) throw new Error(`Unknown modifier: ${modYaml.type}`);

    const args = { ...modYaml };
    delete args.type;

    return new ModClass(...Object.values(args));
}
