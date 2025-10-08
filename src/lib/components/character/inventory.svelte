<script lang="ts">
	import type { Item } from '$lib/types/item';
	import ItemRenderer from '../itemRenderer.svelte';

	const { inventory }: { inventory: Item[] } = $props();

	const baseSlots = 25; // minimum visible slots
	const totalSlots = Math.max(inventory.length, baseSlots);
</script>

<div class="m-2 inline-grid h-full w-full max-w-96 grid-cols-5 gap-2">
	{#each Array(totalSlots) as _, index (inventory[index]?.uid ?? `empty-${index}`)}
		{@const item = inventory[index]}
		{#if item}
			<ItemRenderer {item} pclass="" equippedSlot={undefined} />
		{:else}
			<div class="h-16 w-16 rounded-lg"></div>
		{/if}
	{/each}
</div>
