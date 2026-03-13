<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronsUpDown } from '@lucide/svelte';
	import { buttonVariants } from '../button';
	import Button from '../button/button.svelte';
	import { type Item } from '$lib/types/item';
	import { type MouseEventHandler } from 'svelte/elements';
	import ItemRenderer from '../itemRenderer.svelte';
	import { ReforgeModifier } from '$lib/modifiers/reforges';
	import ItemSelectMenu from '$lib/components/itemSelectMenu.svelte';
	import { getInventory } from '$lib/remote/inventory.remote';
	import { getEquipment } from '$lib/remote/equipment.remote';

	const allItems: Item[] = [
		...(await getInventory()).contents,
		...(await getEquipment()).toArray()
	];

	let item: Item | undefined;
	let currentItem: Item | undefined = $state<Item | undefined>(item);

	let reforgeModifier = $derived.by<ReforgeModifier | undefined>(() => {
		if (!currentItem) return undefined;
		return currentItem.modifiers.find((m) => m.type == 'Reforge') as ReforgeModifier;
	});

	let selectMenuOpened: boolean = $state(false);
	let selectMenu: ItemSelectMenu;
	let mouseX: number = $state(0);
	let mouseY: number = $state(0);

	function toggleSelectMenu(e: MouseEvent) {
		selectMenuOpened = !selectMenuOpened;
		mouseX = e.clientX + 10;
		mouseY = e.clientY - 10;
	}

	function filter(item: Item): boolean {
		return item.modifiers.some((mod) => mod.type === 'Reforgeable');
	}

	function onselect(item: CustomEvent) {
		toggleItem(item.detail);
		selectMenuOpened = false;
	}

	function toggleItem(item: Item | undefined) {
		currentItem = item;
	}
</script>

<Collapsible.Root class="w-full p-0">
	<Card.Root class="w-full p-2 px-0">
		<div class="flex items-center justify-between space-x-4 px-4">
			<span class="text-xl font-semibold">Reforge</span>
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', class: 'w-9 p-0' })}>
				<ChevronsUpDown size="24" />
			</Collapsible.Trigger>
		</div>
		<Collapsible.Content>
			<Card.Content>
				<div class="flex flex-col items-center justify-center gap-4">
					{@render itemSelectButton(
						currentItem,
						'Item',
						(e) => {
							toggleSelectMenu(e);
						},
						toggleItem
					)}
					<span>
						{#if currentItem}
							{reforgeModifier?.displayName}
						{/if}
					</span>
					<Button>Reforge</Button>
				</div>
			</Card.Content>
		</Collapsible.Content>
	</Card.Root>
</Collapsible.Root>

{#snippet itemSelectButton(
	item: Item | undefined,
	buttonText: string,
	onclick: MouseEventHandler<HTMLButtonElement> | null | undefined,
	toggle: (item: Item | undefined) => void
)}
	{#if item}
		{#key item}
			<button onclick={(e) => toggle(undefined)}>
				<ItemRenderer {item} />
			</button>
		{/key}
	{:else}
		<button
			class="flex size-16 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-border bg-border p-2 text-xs select-none"
			{onclick}
		>
			<span>Select</span>
			<span>{buttonText}</span>
		</button>
	{/if}
{/snippet}

{#if selectMenuOpened}
	<ItemSelectMenu
		items={allItems}
		x={mouseX}
		y={mouseY}
		bind:this={selectMenu}
		on:select={onselect}
		{filter}
	/>
{/if}
