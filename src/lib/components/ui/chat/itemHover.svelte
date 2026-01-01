<script lang="ts">
	import { tooltip } from '$lib/components/tooltip';
	import type { Item } from '$lib/types/item';
	import { getItemData } from '$lib/utils/item';

	const { item }: { item: Item } = $props();
</script>

<div
	class="test-sm inline-flex cursor-default items-center gap-2 rounded-md border-2 border-ring bg-card px-1 text-card-foreground"
	style={`color:${item.rarity};`}
	use:tooltip={getItemData(item, false)}
>
	<img src={item.icon} alt={item.name} class="inline-block size-4" />
	{item.name}
</div>
