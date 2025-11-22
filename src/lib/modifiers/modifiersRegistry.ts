import type { IItemModifier } from '$lib/types/item';
import { ReforgeModifier, ReforgeableModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { EquippableModifier, StackableModifier } from './basicModifiers';

export const modifierRegistry: Record<string, { new(...args: any[]): IItemModifier; type?: string }> = {
    Stackable: StackableModifier,
    Equippable: EquippableModifier,
    Reforgeable: ReforgeableModifier,
    Reforge: ReforgeModifier,
    Stars: StarsModifier,
    Caduceus: CaduceusModifier,
};

export function instantiateModifier(modYaml: any): IItemModifier {
    const ModClass = modifierRegistry[modYaml.type];
    if (!ModClass) throw new Error(`Unknown modifier: ${modYaml.type}`);

    const args = { ...modYaml };
    delete args.type;

    return new ModClass(...Object.values(args));
}

export function instantiateModifierFromClass(mod: IItemModifier): IItemModifier {
    const ModClass = modifierRegistry[mod.type];
    if (!ModClass) throw new Error(`Unknown modifier: ${mod.type}`);

    const args = { ...mod } as any;
    delete args.type;

    return new ModClass(...Object.values(args));
}