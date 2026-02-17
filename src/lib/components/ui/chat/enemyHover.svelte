<script lang="ts">
	import { tooltip } from '$lib/components/tooltip';
	import type { Enemy } from '$lib/types/enemy';
	import type { Item } from '$lib/types/item';
	import { getEnemyData } from '$lib/utils/enemy';
	import { getItemData } from '$lib/utils/item';

	const { enemy }: { enemy: Enemy } = $props();
</script>

<div
	class="test-sm inline-flex cursor-default items-center gap-2 rounded-md border-2 border-ring bg-card px-1 text-card-foreground"
	use:tooltip={getEnemyData(enemy)}
>
	<img src={enemy.icon} alt={enemy.name} class="inline-block size-4" />
	<span>
		{@html getEnemyData(enemy).title}
	</span>
</div>
