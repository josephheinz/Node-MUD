import type { IItemModifier } from '$lib/types/item';
import { ReforgeModifier, ReforgeableModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { EquippableModifier, StackableModifier } from './basicModifiers';

export const modifierRegistry: Record<
	string,
	{ new (...args: any[]): IItemModifier; type?: string; fromJSON?: (raw: any) => IItemModifier }
> = {
	Stackable: StackableModifier,
	Equippable: EquippableModifier,
	Reforgeable: ReforgeableModifier,
	Reforge: ReforgeModifier,
	Stars: StarsModifier,
	Caduceus: CaduceusModifier
};

/**
 * Create an IItemModifier instance from a raw serialized modifier object.
 *
 * If the registered modifier class exposes a `fromJSON` factory, it will be used; otherwise the raw object's remaining properties (excluding `type`) are passed to the modifier class constructor.
 *
 * @param raw - Serialized modifier object containing a `type` key and any constructor data for that modifier
 * @returns An instantiated `IItemModifier` corresponding to `raw`
 * @throws Error if `raw.type` does not match any registered modifier
 */
export function instantiateModifier(raw: any): IItemModifier {
	const ModClass = modifierRegistry[raw.type];
	if (!ModClass) throw new Error(`Unknown modifier: ${raw.type}`);

	if (typeof ModClass.fromJSON === 'function') {
		return ModClass.fromJSON(raw);
	}

	const args = { ...raw };
	delete args.type;

    return new ModClass(...Object.values(args));
}