import type { IItemModifier, IItemModifierClass, IRawModifierSpec } from '$lib/types/item';

export const modifierRegistry: Record<string, IItemModifierClass> = {};

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
