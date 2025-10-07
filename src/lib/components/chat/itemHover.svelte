<script lang="ts">
	import type { Item } from '$lib/items';
	import { tooltip } from '../tooltip';
	import { getItemData, reviveModifiers } from '$lib/items';
	import { capitalizeFirstLetter, deepClone } from '$lib/types';
	import Fa from 'svelte-fa';
	import * as icons from '@fortawesome/free-solid-svg-icons';

	let { item, mode }: { item: Item; mode: 'ascii' | 'sprite' | 'icon' } = $props();

	let hoverItem: Item = $derived.by(() => {
		let _ = deepClone<Item>(item);
		_.modifiers = reviveModifiers(_.modifiers);
		return _;
	});
</script>

<span
	class="inline-flex cursor-default cursor-pointer items-center gap-2 rounded-md border-4 border-zinc-600 bg-zinc-700 px-1 text-sm text-zinc-300"
	style="color:{hoverItem.rarity};"
	use:tooltip={getItemData(hoverItem, false)}
>
	{@render icon(mode)}
	{hoverItem.name}
</span>

{#snippet icon(m: 'ascii' | 'sprite' | 'icon')}
	{#if item.icon.image}
		<div
			class="inline-block h-4 w-4 bg-current"
			style="
		-webkit-mask: url({item.icon.image}) no-repeat center;
		mask: url({item.icon.image}) no-repeat center;
		-webkit-mask-size: contain;
		mask-size: contain;
		background: {item.rarity};
	"
		></div>
	{:else}
		<span class="ascii-item text-4xl select-none" style="color:{item?.rarity};"
			>{item?.icon?.ascii}</span
		>
	{/if}
{/snippet}
