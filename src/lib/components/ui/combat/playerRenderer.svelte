<script lang="ts">
	import type { Equipment, EquipmentSlot } from '$lib/types/item';
	import { formatNumber } from '$lib/utils/general';
	import { Skull } from '@lucide/svelte';
	import Progress from '../progress/progress.svelte';
	import DamageSpawner from './damageSpawner.svelte';

	const {
		equipment,
		name,
		ref,
		health,
		maxHealth
	}: {
		equipment: Equipment;
		name: string;
		ref?: (api: { spawnDamage: (amount: number, crit?: boolean) => void }) => void;
		health: number;
		maxHealth: number;
	} = $props();

	/* 	let equipment = $state(InitEquipment);
	 */
	const slotPositions: Record<EquipmentSlot, string> = {
		Head: 'absolute size-8 top-2 left-8',
		Body: 'absolute size-10 top-8 left-7 z-2',
		Mainhand: 'absolute size-8 top-14 left-6 rotate-60 z-4',
		Offhand: 'absolute size-6 top-14 left-14 rotate-60 z-3',
		Legs: 'absolute size-10 top-16 left-7 z-1',
		Necklace: 'absolute size-4 top-9.5 left-10 z-2',
		Ring: '',
		Hands: ''
	};

	let spawner: DamageSpawner | undefined;

	$effect(() => {
		if (spawner) ref?.({ spawnDamage: (amount, crit) => spawner!.damage(amount, crit) });
	});
</script>

<div class="relative flex aspect-square size-max flex-col items-center justify-evenly gap-1 p-4">
	{#if health <= 0}
		<div class="absolute z-10 flex size-full items-center justify-center opacity-100">
			<Skull color="oklch(25.8% 0.092 26.042)" fill="oklch(57.7% 0.245 27.325)" size="64" />
		</div>
	{/if}
	<div class={`${health <= 0 ? 'opacity-50' : ''} flex flex-col items-center justify-evenly gap-1`}>
		<h1 class="text-md font-medium">{name}</h1>
		<div class="flex-col items-center justify-evenly gap-1">
			<Progress value={health} max={maxHealth} class="min-w-32 grow-2 [&>*]:bg-rose-500" />
			<div class="flex items-center justify-between">
				<span class="shrink-1">{formatNumber(Math.max(0, health), 'short')}</span>
				<span>{formatNumber(maxHealth, 'short')}</span>
			</div>
		</div>
		<div class="relative aspect-square w-24">
			<img
				src="/images/player.png"
				alt="Player icon"
				class="pointer-events-none absolute inset-0 min-h-24 min-w-24 select-none"
				draggable="false"
			/>
			{#each equipment.export() as [slot, item]}
				{#if item}
					<div class={item.position ?? slotPositions[slot]}>
						<img
							src={item.icon}
							alt={item.name}
							class="pointer-events-none select-none"
							draggable="false"
						/>
					</div>
				{/if}
			{/each}
		</div>
		<DamageSpawner bind:this={spawner} />
	</div>
</div>
