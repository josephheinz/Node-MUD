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

	function spawnRandomDamage() {
		spawner?.damage(
			Math.floor(500 + Math.random() * 50000),
			[true, false][Math.floor(Math.random() * 2)]
		);
	}
	setInterval(() => {
		spawnRandomDamage();
	}, 250);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex aspect-square size-max flex-col items-center justify-evenly gap-1 p-4"
	onclick={spawnRandomDamage}
>
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
