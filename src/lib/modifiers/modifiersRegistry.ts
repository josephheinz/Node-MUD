import type { IItemModifier } from '$lib/types/item';
import { ReforgeModifier, ReforgeableModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { EquippableModifier, StackableModifier } from './basicModifiers';

export const modifierRegistry: Record<string, { new(...args: any[]): IItemModifier; type?: string; fromJSON?: (raw: any) => IItemModifier; }> = {
    Stackable: StackableModifier,
    Equippable: EquippableModifier,
    Reforgeable: ReforgeableModifier,
    Reforge: ReforgeModifier,
    Stars: StarsModifier,
    Caduceus: CaduceusModifier,
};

export function instantiateModifier(raw: any): IItemModifier {
    const ModClass = modifierRegistry[raw.type];
    if (!ModClass) throw new Error(`Unknown modifier: ${raw.type}`);

    if (typeof ModClass.fromJSON === "function") {
        return ModClass.fromJSON(raw);
    }

    const args = { ...raw };
    delete args.type;

    return new ModClass(...Object.values(args));
}
