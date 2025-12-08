<script lang="ts">
	import type { Item } from '$lib/types/item';
	import { tooltip } from '../tooltip';
	import { getItemData } from '$lib/types/item';
	import { reviveModifiers } from '$lib/utils/item';
	import { deepClone } from '$lib/utils/general';

	let { item }: { item: Item } = $props();

	let hoverItem: Item = $derived.by(() => {
		let _ = deepClone<Item>(item);
		_.modifiers = reviveModifiers(_.modifiers);
		return _;
	});
</script>

<span
	class="inline-flex cursor-default items-center gap-2 rounded-md border-2 border-zinc-600 bg-zinc-700 px-1 text-sm text-zinc-300"
	style="color:{hoverItem.rarity};"
	use:tooltip={getItemData(hoverItem, false)}
>
	{@render icon()}
	{hoverItem.name}
</span>

{#snippet icon()}
	{#if item.icon.image}
		<img
			src={item.icon.image}
			alt={item.name + "'s image"}
			class="inline-block h-4 w-4"
		/>
		<!-- <div
			class="inline-block h-4 w-4 bg-current"
			style="
		-webkit-mask: url({item.icon.image}) no-repeat center;
		mask: url({item.icon.image}) no-repeat center;
		-webkit-mask-size: contain;
		mask-size: contain;
		background: {item.rarity};
	"
		></div> -->
	{:else}
		<span class="ascii-item text-4xl select-none" style="color:{item?.rarity};"
			>{item?.icon?.ascii}</span
		>
	{/if}
{/snippet}
