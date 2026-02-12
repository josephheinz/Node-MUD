<script lang="ts">
	import type { Enemy, EnemySize } from '$lib/types/enemy';
	import Progress from '../progress/progress.svelte';

	const { enemy: InitEnemy }: { enemy: Enemy } = $props();
	const sizeClasses: Record<EnemySize, string> = {
		Small: 'size-16',
		Medium: 'size-24',
		Large: 'size-32',
		Huge: 'size-48'
	};

	let enemy = $state(InitEnemy);
</script>

<div class="flex aspect-square size-max flex-col items-center justify-evenly gap-1 p-4">
	<h1 class="text-md font-medium">Lv.{enemy.level} {enemy.name}</h1>
	<Progress
		value={enemy.stats.health}
		max={enemy.stats.maxHealth}
		class="w-full [&>*]:bg-rose-500"
	/>
	<img src={enemy.icon} alt="Enemy icon" class={`aspect-square ${sizeClasses[enemy.size]}`} />
</div>
