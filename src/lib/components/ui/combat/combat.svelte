<script lang="ts">
	import { getProfile } from '$lib/remote/auth.remote';
	import { getEquipment } from '$lib/remote/equipment.remote';
	import { enemyRegistry, type Enemy } from '$lib/types/enemy';
	import Equipment from '../character/equipment.svelte';
	import Inventory from '../character/inventory.svelte';
	import DamageSpawner from './damageSpawner.svelte';
	import EnemyRenderer from './enemyRenderer.svelte';
	import PlayerRenderer from './playerRenderer.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { Skull } from '@lucide/svelte';

	type CombatData = {
		entities: Enemy[];
	};

	let enemyLayouts: string[] = [
		'col-start-2 row-start-2',
		'col-start-2 row-start-3',
		'col-start-2 row-start-1',
		'col-start-1 row-start-2',
		'col-start-1 row-start-3',
		'col-start-1 row-start-1'
	];

	let instanceId: string = $state('a');
	let entities: Enemy[] = $state([]);
	$effect(() => {
		console.log(entities);
	});
</script>

<svelte:boundary>
	{#snippet pending()}
		Loading...
	{/snippet}

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
			<div class="flex h-full justify-stretch">
				<section id="left" class="flex h-full items-center justify-center py-12">
					<PlayerRenderer equipment={await getEquipment()} name={(await getProfile()).username} />
				</section>
				<section id="right" class="grid h-full grow grid-cols-2 grid-rows-3 py-12">
					{#each entities as enemy, index}
						<div class={enemyLayouts[index]}>
							<EnemyRenderer {enemy} />
						</div>
					{/each}
				</section>
			</div>
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
