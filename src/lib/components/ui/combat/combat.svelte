<script lang="ts">
	import { getProfile } from '$lib/remote/auth.remote';
	import { getEquipment } from '$lib/remote/equipment.remote';
	import { enemyRegistry } from '$lib/types/enemy';
	import Equipment from '../character/equipment.svelte';
	import Inventory from '../character/inventory.svelte';
	import CombatWebsocketManager from './combatWebsocketManager.svelte';
	import EnemyRenderer from './enemyRenderer.svelte';
	import PlayerRenderer from './playerRenderer.svelte';

	let instanceId: string = $state('');
</script>

<svelte:boundary>
	{#snippet pending()}
		Loading...
	{/snippet}
	<div class="absolute -m-4 grid size-full grid-cols-[3fr_1fr] grid-rows-[9fr_1fr]">
		<main class="p-6">
			<CombatWebsocketManager bind:instance={instanceId} />
			Instance: {instanceId}
			<EnemyRenderer enemy={enemyRegistry['slime']} />
			<PlayerRenderer equipment={await getEquipment()} name={(await getProfile()).username} />
		</main>
		<aside class="flex flex-col justify-evenly gap-4 p-2">
			<Equipment />
			<Inventory />
		</aside>
		<footer
			class="col-span-2 flex items-center justify-start gap-4 border-t-1 border-ring bg-card p-4"
		>
			a
		</footer>
	</div>
</svelte:boundary>
