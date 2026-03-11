<script lang="ts">
	import DamageNumber from './damageNumber.svelte';

	type DamageInstance = { id: number; value: number; x: number; y: number; crit: boolean };
	let damages = $state<DamageInstance[]>([]);
	let idCounter = 0;

	let container: HTMLDivElement;

	/** Spawn damage randomly within container bounds */
	export function damage(value: number, crit: boolean = false) {
		if (!container) return;

		const rect = container.getBoundingClientRect();
		const x = Math.random() * rect.width;
		const y = Math.random() * rect.height;

		const id = idCounter++;
		damages = [...damages, { id, value, x, y, crit }];
	}

	function removeDamage(id: number) {
		damages = damages.filter((d) => d.id !== id);
	}
</script>

<div bind:this={container} class="pointer-events-none absolute inset-0">
	{#each damages as dmg (dmg.id)}
		<DamageNumber
			value={dmg.value}
			xOrigin={dmg.x}
			yOrigin={dmg.y}
			crit={dmg.crit}
			onComplete={() => removeDamage(dmg.id)}
		/>
	{/each}
</div>
