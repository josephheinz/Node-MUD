<script lang="ts">
	import { Equipment, Inventory, type EquipmentSlot, type Item } from '$lib/types/item';
	import * as ContextMenu from './context-menu/index';
	import { tooltip } from '../tooltip';
	import { determineSlot, getDisplayName, getItemData, encodeDBItem } from '$lib/utils/item';
	import { gameState } from '$lib/store.svelte';
	import { toast } from 'svelte-sonner';
	import type { StackableModifier } from '$lib/modifiers/basicModifiers';
	import { formatNumber } from '$lib/utils/general';
	import { linkItemToChat } from '$lib/utils/chat';
	import { equip, getEquipment, unequip } from '$lib/remote/equipment.remote';
	import { getUser } from '$lib/remote/auth.remote';
	import { getInventory } from '$lib/remote/inventory.remote';

	type Props = {
		item: Item;
		class?: string;
		equipFlags: EquippedFlags;
	};

	type EquippedFlags = {
		equippedSlot?: EquipmentSlot;
		equippable: boolean;
	};

	const { item, class: userClass = '', equipFlags }: Props = $props();

	const stackMod: StackableModifier | undefined = item.modifiers.find(
		(m) => m.type === 'Stackable'
	) as StackableModifier;

	async function tryEquip() {
		const userId = (await getUser()).id;
		if (!userId) {
			toast.error('User not authenticated', { duration: 2500 });
			return;
		}

		const slot = determineSlot(item);
		if (!slot) {
			console.warn(`Item ${item.id} is not equippable`);
			return;
		}

		if (equipFlags.equippable && equipFlags.equippedSlot) {
			// Unequip logic
			try {
				const result = await unequip({
					id: userId,
					slot: slot
				});

				toast.success(`Successfully unequipped ${item.name}`, {
					duration: 2500
				});

				await getEquipment().refresh();
				await getInventory().refresh();
			} catch (error) {
				toast.error(`Failed to unequip item: ${item.name}`, {
					duration: 2500
				});

				console.error('Failed to unequip item:', error);
			}
		} else {
			// Equip logic
			const replacedItem = gameState.equipment[slot];

			try {
				const result = await equip({
					id: userId,
					dbItem: encodeDBItem(item)
				});

				const description = replacedItem ? `Replaced ${replacedItem.name} in ${slot}` : '';

				toast.success(`Successfully equipped ${item.name}`, {
					description,
					duration: 2500
				});

				await getEquipment().refresh();
				await getInventory().refresh();
			} catch (error) {
				toast.error(`Failed to equip item: ${item.name}`, {
					duration: 2500
				});

				console.error('Failed to equip item:', error);
			}
		}
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="max-h-16 max-w-16 relative flex aspect-square size-full items-center justify-center rounded-lg bg-card select-none {userClass}"
		style="border:2px solid {item?.rarity ?? 'transparent'}"
		title=""
	>
		<div class="relative size-full p-2" use:tooltip={getItemData(item, equipFlags.equippable)}>
			<img src={item.icon} alt={item.name} class="image-rendering-pixelated size-full" />
		</div>
		{#if stackMod}
			<span
				class="text-md pointer-events-none absolute right-0.5 bottom-0 text-stroke-2 text-stroke-zinc-800 font-extrabold text-white shadow-xs"
			>
				{formatNumber(stackMod.amount, 'short')}
			</span>
		{/if}
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content
			class="min-w-[150px] rounded-md bg-background p-2 text-foreground shadow-lg"
		>
			<ContextMenu.Item
				class="cursor-pointer rounded bg-background px-2 py-1 hover:bg-secondary"
				onclick={() => {
					linkItemToChat(item);
				}}
			>
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
