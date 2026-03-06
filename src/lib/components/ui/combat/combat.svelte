<script lang="ts">
	import { getProfileById } from '$lib/remote/auth.remote';
	import { getEquipmentById } from '$lib/remote/equipment.remote';
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
	import type {
		CombatEntity,
		EntityUpdates,
		ICombatEndState,
		ICombatState
	} from '$lib/types/combat';
	import type { UUID } from 'node:crypto';
	import { enemyStatsToStatList, getModifiedStats } from '$lib/types/stats';
	import * as Dialog from '$lib/components/ui/dialog';
	import CombatEndedDialog from './combatEndedDialog.svelte';

	type RendererAPI = { spawnDamage: (amount: number, crit?: boolean) => void };

	let enemyLayouts: string[] = [
		'col-start-2 row-start-2',
		'col-start-2 row-start-3',
		'col-start-2 row-start-1',
		'col-start-1 row-start-2',
		'col-start-1 row-start-3',
		'col-start-1 row-start-1'
	];

	let combatState = $state<ICombatState | null>(null);

	let instanceId: string = $state('');
	let entities: CombatEntity[] = $derived.by(() => combatState?.entities ?? []);
	let players: CombatEntity[] = $derived(combatState?.players ?? []);
	let loading: boolean = $state(true);
	let timeUntilNextTick: number = $state(10_000);
	let currentTick = $state(0);

	let entityMap = new Map<UUID, RendererAPI>();

	let endedDialogOpen: boolean = $state(false);
	let endedState: ICombatEndState | null = $state(null);

	function runUpdates(updates: EntityUpdates[]) {
		updates.forEach((update: EntityUpdates) => {
			if (!update.action) return;

			const targetId = update.action.target;
			const targetComponent = entityMap.get(targetId);
			if (update.action.type === 'attack') {
				const attack = update.action;

				if (attack.value) targetComponent?.spawnDamage(attack.value, attack.crit);
			}
		});
	}

	const tickInterval = useInterval(() => timeUntilNextTick, {
		immediate: true,
		immediateCallback: true,
		callback: (_) => {
			if (instanceId.trim() === '') return;
			tickCombatInstance(instanceId).then((response) => {
				if (response.nextTick) {
					timeUntilNextTick = response.nextTick;
				}
				console.log('combat ticking');
				if (response.state) {
					if (
						response.state.updates &&
						currentTick != response.state.tick &&
						response.state.ticking
					) {
						runUpdates(response.state.updates);
					}

					currentTick = response.state.tick;
					console.log(response.state);
					combatState = response.state as ICombatState;

					if (response.state.ended) {
						endedDialogOpen = true;
					}
				}
			});
		}
	});

	onMount(() => {
		console.log(entities);
		getPlayerInstance().then((response) => {
			if (response != null) instanceId = response;
			else return;

			getInstance(instanceId).then((instanceResponse) => {
				if (instanceResponse != null) combatState = instanceResponse;
			});
			loading = false;
		});
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
	<Dialog.Root bind:open={endedDialogOpen}>
		<div class="absolute -m-4 grid size-full grid-cols-[3fr_1fr] grid-rows-[9fr_1fr]">
			<main class="p-6">
				Instance: {instanceId}
				<div class="flex h-full justify-stretch">
					<section id="left" class="flex h-full flex-col items-center justify-center py-12">
						<svelte:boundary>
							{#snippet pending()}
								<span>loading</span>
							{/snippet}
							{#each players as player (player.id)}
								{@const equipment = await getEquipmentById(player.id)}
								{@const stats = getModifiedStats(enemyStatsToStatList(player.stats), equipment)}
								<PlayerRenderer
									equipment={await getEquipmentById(player.id)}
									name={(await getProfileById(player.id))?.username ?? player.id}
									ref={(api) => entityMap.set(player.id, api)}
									health={stats.health.amount}
									maxHealth={stats.maxHealth.amount}
								/>
							{/each}
						</svelte:boundary>
					</section>
					<section id="right" class="grid h-full grow grid-cols-2 grid-rows-3 py-12">
						{#each entities as enemy, index}
							{@const loadedEnemy = getCombatEnemy(enemy)}
							<div class={enemyLayouts[index]}>
								<EnemyRenderer enemy={loadedEnemy} ref={(api) => entityMap.set(enemy.id, api)} />
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
		<CombatEndedDialog ended={endedState} />
	</Dialog.Root>
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
