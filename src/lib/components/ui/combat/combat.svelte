<script lang="ts">
	import { getProfile } from '$lib/remote/auth.remote';
	import { getEquipment } from '$lib/remote/equipment.remote';
	import { type Enemy } from '$lib/types/enemy';
	import Equipment from '../character/equipment.svelte';
	import Inventory from '../character/inventory.svelte';
	import EnemyRenderer from './enemyRenderer.svelte';
	import PlayerRenderer from './playerRenderer.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import { Skull } from '@lucide/svelte';
	import { getInstance, getPlayerInstance, tickCombatInstance } from '$lib/remote/combat.remote';
	import { getCombatEnemy } from '$lib/utils/enemy';
	import Spinner from '../spinner/spinner.svelte';
	import { useInterval } from 'runed';
	import { onDestroy, onMount } from 'svelte';

	let enemyLayouts: string[] = [
		'col-start-2 row-start-2',
		'col-start-2 row-start-3',
		'col-start-2 row-start-1',
		'col-start-1 row-start-2',
		'col-start-1 row-start-3',
		'col-start-1 row-start-1'
	];

	let instanceId: string = $state('');
	let entities: Enemy[] = $state([]);
	let loading: boolean = $state(true);
	let timeUntilNextTick: number = $state(10_000);

	const tickInterval = useInterval(() => timeUntilNextTick, {
		immediate: true,
		immediateCallback: false,
		callback: (_) => {
			if (instanceId.trim() === '') return;
			tickCombatInstance(instanceId).then((response) => {
				console.log('combat ticking');
				console.log(response);
			});
		}
	});

	onMount(() => {
		console.log(entities);
		getPlayerInstance().then((response) => {
			if (response != null) instanceId = response;
			else return;

			getInstance(instanceId).then((instanceResponse) => {
				if (instanceResponse != null) {
					console.log(instanceResponse.entities);
					entities = instanceResponse.entities.map(getCombatEnemy);
				}
			});
			loading = false;
		});
	});

	$effect(() => {
		console.log(entities);
	});

	onDestroy(() => {
		timeUntilNextTick = Infinity;
		tickInterval.pause();
	});
</script>

<svelte:boundary>
	{#if loading}
		{@render loadingScreen()}
	{:else if instanceId == ''}
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

{#snippet loadingScreen()}
	<div class="flex size-full flex-col items-center justify-center gap-4">
		<h1 class="text-4xl font-black">Loading...</h1>
		<Spinner class="size-8" />
	</div>
{/snippet}
