<script lang="ts">
	import { getProfile } from '$lib/remote/auth.remote';
	import { getEquipment } from '$lib/remote/equipment.remote';
	import { enemyRegistry } from '$lib/types/enemy';
	import Equipment from '../character/equipment.svelte';
	import Inventory from '../character/inventory.svelte';
	import CombatWebsocketManager from './combatWebsocketManager.svelte';
	import DamageSpawner from './damageSpawner.svelte';
	import EnemyRenderer from './enemyRenderer.svelte';
	import PlayerRenderer from './playerRenderer.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { Skull } from '@lucide/svelte';

	let instanceId: string = $state('');
</script>

<svelte:boundary>
	{#snippet pending()}
		Loading...
	{/snippet}
	
	<CombatWebsocketManager bind:instance={instanceId} />

	{#if instanceId == ''}
		{@render emptyInstance()}
	{:else}
		{@render inInstance()}
	{/if}
</svelte:boundary>

{#snippet inInstance()}
	<div class="absolute -m-4 grid size-full grid-cols-[3fr_1fr] grid-rows-[9fr_1fr]">
		<main class="p-6">
			Instance: {instanceId}
			<EnemyRenderer enemy={enemyRegistry['king_slime']} />
			<PlayerRenderer equipment={await getEquipment()} name={(await getProfile()).username} />
			<DamageSpawner />
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
{/snippet}

{#snippet emptyInstance()}
	<div class="flex size-full items-center justify-center">
		<Empty.Root>
			<Empty.Header>
				<Empty.Media>
					<Skull size="64" />
				</Empty.Media>
				<Empty.Title class="text-5xl font-black">Not in an instance</Empty.Title>
				<Empty.Description>Go to the actions tab and queue some combat actions</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	</div>
{/snippet}
