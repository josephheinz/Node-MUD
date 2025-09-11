<script lang="ts">
	import { type Item, getItemData } from '$lib/items';
	import { tooltip, type ITooltipData } from './tooltip';
	const { item, mode = 'ascii' }: { item: Item; mode: 'ascii' | 'sprite' } = $props();
</script>

<div
	class="flex h-16 w-16 items-center justify-center rounded-lg bg-zinc-600 p-2"
	style="border:2px solid {item?.rarity};"
	use:tooltip={getItemData(item)}
>
	{#if mode == 'ascii'}
		<span class="ascii-item text-4xl select-none" style="color:{item?.rarity};">{item?.icon?.ascii}</span>
	{:else if mode == 'sprite'}
		<img src={item?.icon?.image} alt="Item sprite" />
	{/if}
</div>
