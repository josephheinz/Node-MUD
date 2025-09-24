import type { IItemModifier } from '$lib/items';
import { ReforgeModifier, ReforgeableModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { EquippableModifier } from './basicModifiers';

export const modifierRegistry: Record<string, { new(...args: any[]): IItemModifier; type?: string }> = {
    Stars: StarsModifier,
    Caduceus: CaduceusModifier,
    Equippable: EquippableModifier,
    Reforge: ReforgeModifier,
    Reforgeable: ReforgeableModifier
};

export function instantiateModifier(modYaml: any): IItemModifier {
    const ModClass = modifierRegistry[modYaml.type];
    if (!ModClass) throw new Error(`Unknown modifier: ${modYaml.type}`);

    const args = { ...modYaml };
    delete args.type;

    return new ModClass(...Object.values(args));
}
