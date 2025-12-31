<script lang="ts">
	import { Equipment, Inventory, type EquipmentSlot, type Item } from '$lib/types/item';
	import * as ContextMenu from './context-menu/index';
	import { tooltip } from '../tooltip';
	import { determineSlot, Equip, getDisplayName, getItemData, Unequip } from '$lib/utils/item';
	import { gameState } from '$lib/store.svelte';
	import { toast } from 'svelte-sonner';
	import type { StackableModifier } from '$lib/modifiers/basicModifiers';
	import { formatNumber } from '$lib/utils/general';

	type Props = {
		item: Item;
		class?: string;
		equipFlags: EquippedFlags;
	};

	type EquippedFlags = {
		equippedSlot?: EquipmentSlot;
		equippable: boolean;
	};

	async function tryEquip() {
		if (equipFlags.equippable && equipFlags.equippedSlot) {
			const slot = determineSlot(item);
			if (slot) {
				// Store originals for rollback
				const originalEquipment = gameState.equipment;
				const originalInventory = gameState.inventory;

				// Optimistic update - update UI immediately
				// Messy
				const optimisticInventory = new Inventory([
					...gameState.inventory.contents,
					...(gameState.equipment[slot] ? [gameState.equipment[slot]] : [])
				]);
				const optimisticEquipment = new Equipment({
					...gameState.equipment,
					[slot]: null
				});

				gameState.equipment = optimisticEquipment;
				gameState.inventory = optimisticInventory;

				try {
					// Call server
					const { equipment: newEq, inventory: newInv } = await Unequip(
						originalEquipment,
						item,
						gameState.user?.id
					);

					// Server confirmed - update with server state
					if (newEq) gameState.equipment = newEq;
					if (newInv) gameState.inventory = newInv;

					toast.success(`Successfully unequipped ${item.name}`, {
						duration: 2500
					});
				} catch (error) {
					gameState.equipment = originalEquipment;
					gameState.inventory = originalInventory;

					toast.error(`Failed to unequip item: ${item.name}`, {
						duration: 2500
					});

					console.error('Failed to unequip item:', error);
				}
			} else {
				console.warn(`Item ${item.id} is not equippable`);
			}
		} else {
			const slot = determineSlot(item);
			if (slot) {
				// Store originals for rollback
				const originalEquipment = gameState.equipment;
				const originalInventory = gameState.inventory;

				// Optimistic update - update UI immediately
				// Messy
				const optimisticInventory = new Inventory([
					...gameState.inventory.contents.filter((i) => i !== item),
					...(gameState.equipment[slot] ? [gameState.equipment[slot]] : [])
				]);
				const optimisticEquipment = new Equipment({
					...gameState.equipment,
					[slot]: item
				});

				const optimisticReplaceItem: Item | null = originalEquipment[slot];

				gameState.equipment = optimisticEquipment;
				gameState.inventory = optimisticInventory;

				try {
					// Call server
					const { equipment: newEq, inventory: newInv } = await Equip(item, gameState.user?.id);

					// Server confirmed - update with server state
					if (newEq) gameState.equipment = newEq;
					if (newInv) gameState.inventory = newInv;

					let description = optimisticReplaceItem
						? `Replaced ${optimisticReplaceItem.name} in ${slot}`
						: '';

					toast.success(`Successfully equipped ${item.name}`, {
						description,
						duration: 2500
					});
				} catch (error) {
					gameState.equipment = originalEquipment;
					gameState.inventory = originalInventory;

					toast.error(`Failed to equip item: ${item.name}`, {
						duration: 2500
					});

					console.error('Failed to equip item:', error);
				}
			} else {
				console.warn(`Item ${item.id} is not equippable`);
			}
		}
	}

	const { item, class: userClass = '', equipFlags }: Props = $props();

	const stackMod: StackableModifier | undefined = item.modifiers.find(
		(m) => m.type === 'Stackable'
	) as StackableModifier;
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="relative flex h-16 w-16 items-center justify-center rounded-lg bg-card select-none {userClass}"
		style="border:2px solid {item?.rarity ?? 'transparent'}"
		title=""
	>
		<div class="relative size-full p-2" use:tooltip={getItemData(item, equipFlags.equippable)}>
			<img src={item.icon} alt={item.name} class="image-rendering-pixelated size-full" />
		</div>
		{#if stackMod}
			<span
				class="pointer-events-none absolute right-0.5 bottom-0 text-stroke-2 text-stroke-zinc-800 text-lg font-semibold text-white shadow-xs"
				>{formatNumber(stackMod.amount)}</span
			>
		{/if}
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content
			class="min-w-[150px] rounded-md bg-background p-2 text-foreground shadow-lg"
		>
			<ContextMenu.Item class="cursor-pointer rounded bg-background px-2 py-1 hover:bg-secondary">
				Link to chat
			</ContextMenu.Item>

			{#if equipFlags.equippable && determineSlot(item) != undefined}
				<ContextMenu.Item
					onclick={tryEquip}
					class="cursor-pointer rounded bg-background px-2 py-1 hover:bg-secondary"
				>
					{equipFlags.equippedSlot !== undefined ? 'Unequip' : 'Equip'}
				</ContextMenu.Item>
			{/if}
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
