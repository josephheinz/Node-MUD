<script lang="ts">
	import type { Item } from '$lib/items';
	import { tooltip } from '../tooltip';
	import { getItemData, reviveModifiers } from '$lib/items';
	import { deepClone } from '$lib/types';

	let { item, mode }: { item: Item; mode: 'ascii' | 'sprite' } = $props();

	let hoverItem: Item = $derived.by(() => {
		let _ = deepClone<Item>(item);
		_.modifiers = reviveModifiers(_.modifiers);
		return _;
	});
</script>

<span
	class="cursor-default cursor-pointer rounded-md border-4 border-zinc-600 bg-zinc-700 px-2 text-zinc-300 text-sm"
	style="color:{hoverItem.rarity};"
	use:tooltip={getItemData(hoverItem, false)}
>
	{@render icon(mode)}
	{hoverItem.name}
</span>

{#snippet icon(m: "ascii" | "sprite")}
	{#if m === 'ascii'}
		<span
			class="text-zinc-400"
			style="color: {hoverItem.rarity};"
			>{hoverItem.icon.ascii}</span
		>
	{:else if m === 'sprite'}
		<img
			src={hoverItem.icon.image}
			alt={hoverItem.name}
			class="aspect-square h-5 inline-block"
			style="filter: drop-shadow(0 0 2px {hoverItem.rarity});"
		/>
	{/if}
{/snippet}