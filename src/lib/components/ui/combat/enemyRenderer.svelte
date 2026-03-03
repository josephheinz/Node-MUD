<script lang="ts">
	import type { Enemy, EnemySize } from '$lib/types/enemy';
	import Progress from '../progress/progress.svelte';
	import DamageSpawner from './damageSpawner.svelte';

	const { enemy: InitEnemy }: { enemy: Enemy } = $props();
	const sizeClasses: Record<EnemySize, string> = {
		Small: 'size-16',
		Medium: 'size-24',
		Large: 'size-32',
		Huge: 'size-48'
	};

	let enemy = $state(InitEnemy);

	let spawner: DamageSpawner | undefined;
</script>

<div class="relative flex aspect-square size-max flex-col items-center justify-evenly gap-1 p-4">
	<h1 class="text-md font-medium">Lv.{enemy.level} {enemy.name}</h1>
	<Progress
		value={enemy.stats.health}
		max={enemy.stats.maxHealth}
		class="w-full [&>*]:bg-rose-500"
	/>
	<div class="relative">
		<img
			src={enemy.icon}
			alt="Enemy icon"
			class={`pointer-events-none aspect-square select-none ${sizeClasses[enemy.size]}`}
			draggable="false"
		/>
		<DamageSpawner bind:this={spawner} />
	</div>
</div>
