<script lang="ts">
	import { tooltip } from '$lib/components/tooltip';
	import type { Enemy } from '$lib/types/enemy';
	import { getEnemyData } from '$lib/utils/enemy';

	const { enemy, amount = 1 }: { enemy: Enemy; amount?: number } = $props();
</script>

<div
	class="relative flex aspect-square min-w-16 flex-col items-center justify-start gap-1"
	use:tooltip={getEnemyData(enemy)}
>
	<img src={enemy.icon} alt={enemy.name} class="pixelated" />
	{#if amount > 1}
		<span
			class="absolute right-1 bottom-1 text-stroke-2 text-stroke-zinc-800 text-lg font-black text-white"
			>x{amount}</span
		>
	{/if}
</div>
