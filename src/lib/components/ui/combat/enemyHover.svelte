<script lang="ts">
	import { tooltip } from '$lib/components/tooltip';
	import type { Enemy } from '$lib/types/enemy';
	import { getEnemyData } from '$lib/utils/enemy';

	const { enemy, amount }: { enemy: Enemy; amount: number } = $props();
</script>

<div class="relative aspect-square min-w-24 p-4" use:tooltip={getEnemyData(enemy)}>
	<img src={enemy.icon} alt={enemy.name} class="size-full" />
	<span
		class="absolute right-1 bottom-1 text-stroke-2 text-stroke-zinc-800 text-lg font-black text-white"
	>
		x{amount}
	</span>
</div>
