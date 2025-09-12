import type { IItemModifier } from '$lib/items';
import { SharpModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { AttackModifier } from './statModifiers';

export const modifierRegistry: Record<string, { new(...args: any[]): IItemModifier; type?: string }> = {
    Sharp: SharpModifier,
    Stars: StarsModifier,
    Caduceus: CaduceusModifier,
    Attack: AttackModifier
};

export function instantiateModifier(modYaml: any): IItemModifier {
    const ModClass = modifierRegistry[modYaml.type];
    if (!ModClass) throw new Error(`Unknown modifier: ${modYaml.type}`);

    const args = { ...modYaml };
    delete args.type;

    return new ModClass(...Object.values(args));
}
