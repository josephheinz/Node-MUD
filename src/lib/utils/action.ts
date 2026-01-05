import type { StackableModifier } from '$lib/modifiers/basicModifiers';
import type { Inventory, Item } from '$lib/types/item';

export function getInventoryCounts(
	inventory: Inventory,
	inputs: { item: Item; amount: number }[]
): { id: string; required: number; present: number }[] {
	return inputs.map(({ item, amount }) => {
		let count: number = 0;
		const stackableModifier: StackableModifier | undefined = item.modifiers.find(
			(m) => m.type == 'Stackable'
		) as StackableModifier;
		if (stackableModifier) {
			inventory.contents
				.filter((i) => i.id === item.id)
				.forEach((instance: Item) => {
					count += (instance.modifiers.find((m) => m.type === 'Stackable') as StackableModifier)
						.amount;
				});
		} else {
			count = inventory.contents.filter((i) => i.id === item.id).length;
		}
		return {
			id: item.id,
			required: amount,
			present: count
		};
	});
}
