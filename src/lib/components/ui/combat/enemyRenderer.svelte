<script lang="ts">
	import type { Enemy, EnemySize } from '$lib/types/enemy';
	import { formatNumber } from '$lib/utils/general';
	import { Skull } from '@lucide/svelte';
	import Progress from '../progress/progress.svelte';
	import DamageSpawner from './damageSpawner.svelte';

	const {
		enemy: InitEnemy,
		ref
	}: {
		enemy: Enemy;
		ref?: (api: { spawnDamage: (amount: number, crit?: boolean) => void }) => void;
	} = $props();

	const sizeClasses: Record<EnemySize, string> = {
		Small: 'size-16',
		Medium: 'size-24',
		Large: 'size-32',
		Huge: 'size-48'
	};

	let enemy = $derived(InitEnemy);

	let spawner: DamageSpawner | undefined;

	$effect(() => {
		if (spawner) ref?.({ spawnDamage: (amount, crit) => spawner!.damage(amount, crit) });
	});
</script>

<div class="relative flex aspect-square size-max flex-col items-center justify-evenly gap-1 p-4">
	{#if enemy.stats.health <= 0}
		<div class="absolute z-10 flex size-full items-center justify-center opacity-100">
			<Skull color="oklch(25.8% 0.092 26.042)" fill="oklch(57.7% 0.245 27.325)" size="64" />
		</div>
	{/if}
	<div
		class={`${enemy.stats.health <= 0 ? 'opacity-50' : ''} flex flex-col items-center justify-evenly gap-1`}
	>
		<h1 class="text-md font-medium">Lv.{enemy.level} {enemy.name}</h1>
		<div class="flex-col items-center justify-evenly gap-1">
			<Progress
				value={enemy.stats.health}
				max={enemy.stats.maxHealth}
				class="min-w-32 grow-2 [&>*]:bg-rose-500"
			/>
			<div class="flex items-center justify-between">
				<span class="shrink-1">{formatNumber(Math.max(0, enemy.stats.health), 'short')}</span>
				<span>{formatNumber(enemy.stats.maxHealth, 'short')}</span>
			</div>
		</div>
		<div class="relative">
			<img
				src={enemy.icon}
				alt="Enemy icon"
				class={`pointer-events-none aspect-square select-none ${sizeClasses[enemy.size]} `}
				draggable="false"
			/>
			<DamageSpawner bind:this={spawner} />
		</div>
	</div>
</div>
