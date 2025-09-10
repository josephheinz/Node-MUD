<script lang="ts">
	import { Rarity, type Item } from '$lib/items';
	const { item, mode = 'ascii' }: { item: Item; mode: 'ascii' | 'sprite' } = $props();
</script>

<div class="flex h-16 w-16 items-center justify-center {mode == "sprite" ? 'border-[{item?.rarity}] border-2' : ''} rounded-lg bg-zinc-600 p-2">
	{#if mode == 'ascii'}
		<span class="ascii-item text-4xl" style="color:{item?.rarity};">{item?.icon?.ascii}</span>
	{:else if mode == 'sprite'}
		<img src={item?.icon?.image} alt="Item sprite" />
	{/if}
</div>
