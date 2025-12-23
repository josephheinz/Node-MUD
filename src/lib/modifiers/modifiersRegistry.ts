import type { HashableModifier, HashableModifierClass, IItemModifier } from '$lib/types/item';
import { ReforgeModifier, ReforgeableModifier } from './reforges';
import { StarsModifier } from './stars';
import { CaduceusModifier } from './special';
import { EnhancerModifier, EquippableModifier, StackableModifier } from './basicModifiers';
import { EnchantmentModifier } from './enchantments';

export type ModifierDiff = {
	type: IItemModifier['type'];
} & Partial<Record<Exclude<keyof IItemModifier, 'type'>, unknown>>;

export const modifierRegistry: Record<
	string,
	HashableModifierClass<IItemModifier & HashableModifier>
> = {
	Stackable: StackableModifier,
	Equippable: EquippableModifier,
	Reforgeable: ReforgeableModifier,
	Reforge: ReforgeModifier,
	Stars: StarsModifier,
	Caduceus: CaduceusModifier,
	Enhancer: EnhancerModifier,
	Enchantment: EnchantmentModifier
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
export function instantiateModifier(raw: any): IItemModifier & HashableModifier {
	const ModClass = modifierRegistry[raw.type];
	if (!ModClass) throw new Error(`Unknown modifier: ${raw.type}`);

	const args = { ...raw };
	delete args.type;

	return new ModClass(...Object.values(args));
}

export function instantiateModifierFromHash(hash: string): IItemModifier & HashableModifier {
	const type = hash.split(':')[0];
	const ModClass = modifierRegistry[type];
	if (!ModClass) throw new Error(`Unknown modifier: ${type}`);
	return ModClass.fromHash(hash);
}

export function cloneModifier<T extends IItemModifier>(mod: T): T {
	return Object.assign(Object.create(Object.getPrototypeOf(mod)), mod);
}
