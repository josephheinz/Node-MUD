<script lang="ts">
	import type { Equipment, EquipmentSlot } from '$lib/types/item';
	import Progress from '../progress/progress.svelte';

	const { equipment, name }: { equipment: Equipment; name: string } = $props();

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
</script>

<div class="relative flex size-max flex-col items-center justify-evenly gap-1 p-4">
	<h1 class="text-md font-medium">{name}</h1>
	<Progress value={100} max={100} class="w-full [&>*]:bg-rose-500" />
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
</div>
