import type { IItemModifier, IItemModifierClass, IRawModifierSpec } from '$lib/types/item';
import { EquippableModifier, StackableModifier } from './basicModifiers';
import { EnhancerModifier } from './basicModifiers';
import { EnchantmentModifier } from './enchantments';
import { ReforgeableModifier, ReforgeModifier } from './reforges';
import { CaduceusModifier } from './special';
import { StarsModifier } from './stars';

export const modifierRegistry: Record<string, IItemModifierClass> = {
	Stackable: StackableModifier,
	Equippable: EquippableModifier,
	Reforgeable: ReforgeableModifier,
	Reforge: ReforgeModifier,
	Stars: StarsModifier,
	Caduceus: CaduceusModifier,
	Enhancer: EnhancerModifier,
	Enchantment: EnchantmentModifier
};

export function instantiateModifier(raw: IRawModifierSpec): IItemModifier {
	const ModClass = modifierRegistry[raw.type];
	if (!ModClass) throw new Error(`Unknown modifier: ${raw.type}`);

	return ModClass.fromJSON(raw);
}

export function instantiateModifierFromHash(hash: string): IItemModifier {
	const type = hash.split(':')[0];
	const ModClass = modifierRegistry[type];
	if (!ModClass) throw new Error(`Unknown modifier: ${type}`);
	return ModClass.fromHash(hash);
}
