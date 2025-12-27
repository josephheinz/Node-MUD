<script lang="ts">
	import type { EquipmentSlot, Item } from '$lib/types/item';
	import * as ContextMenu from './context-menu/index';
	import { tooltip } from '../tooltip';
	import { getItemData } from '$lib/utils/item';

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
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger
		class="relative flex h-16 w-16 items-center justify-center rounded-lg bg-card {userClass}"
		style="border:2px solid {item?.rarity ?? 'transparent'}"
		title=""
	>
		<div class="relative size-full p-2" use:tooltip={getItemData(item)}>
			<img src={item.icon} alt={item.name} class="image-rendering-pixelated size-full" />
		</div>
	</ContextMenu.Trigger>

	<ContextMenu.Portal>
		<ContextMenu.Content
			class="min-w-[150px] rounded-md bg-background p-2 text-foreground shadow-lg"
		>
			<ContextMenu.Item class="cursor-pointer rounded bg-background px-2 py-1 hover:bg-secondary">
				Link to chat
			</ContextMenu.Item>

			<ContextMenu.Item class="cursor-pointer rounded bg-background px-2 py-1 hover:bg-secondary">
				{equipFlags.equippable ? 'Equip' : 'Unequip'}
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Portal>
</ContextMenu.Root>
