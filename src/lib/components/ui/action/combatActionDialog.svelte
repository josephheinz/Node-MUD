<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { getSkills } from '$lib/remote/skills.remote';
	import type { CombatAction, CombatEnemy } from '$lib/types/combatAction';
	import type { Enemy } from '$lib/types/enemy';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import { getEnemy } from '$lib/utils/enemy';
	import { formatNumber } from '$lib/utils/general';
	import { xpToLevel } from '$lib/utils/skills';
	import Button from '../button/button.svelte';
	import EnemyHover from '../chat/enemyHover.svelte';
	import Input from '../input/input.svelte';
	import Label from '../label/label.svelte';
	import EnemyDisplay from './enemyDisplay.svelte';

	const { action }: { action: CombatAction } = $props();

	let skills: Record<SkillKey, Skill> = await getSkills();

	let amount: number = $state(1);

	let actionSkill: Skill = $derived(skills[action.requirement?.name as SkillKey]);

	let loadedEnemies: { enemy: Enemy; amount: number; chance?: number }[] = $derived(
		action.enemies
			.map((e: CombatEnemy) => {
				const enemy = getEnemy(e.id);
				console.log(enemy, e);
				if (!enemy) return null;
				return { enemy, amount: e.amount, chance: e.chance };
			})
			.filter(Boolean) as { enemy: Enemy; amount: number; chance?: number }[]
	);

	let canAct = $derived.by(() => {
		return action.requirement
			? xpToLevel(actionSkill.xp) >= xpToLevel(action.requirement?.xp)
			: true;
	});
</script>

<Dialog.Content class="w-max min-w-72">
	<Dialog.Header>
		<Dialog.Title>{action.name}</Dialog.Title>
		{#if action.requirement}
			<span
				class={xpToLevel(actionSkill.xp) >= xpToLevel(action.requirement.xp)
					? 'text-muted-foreground'
					: 'text-rose-400'}
				>Requires Level {xpToLevel(action.requirement.xp)}
				{action.requirement.name}
			</span>
		{/if}
		<form class="flex w-full flex-col gap-4">
			<div>
				<h1 class="text-start text-lg font-semibold">Enemies:</h1>
				<ul>
					{#each loadedEnemies as { enemy, amount: eAmount, chance }, index}
						<li class="my-1 flex items-center justify-start gap-2 pl-4">
							<EnemyDisplay {enemy} amount={eAmount} />
						</li>
					{/each}
				</ul>
			</div>
			<div class="flex gap-2">
				<Label for="amount" class="text-md font-semibold">Amount:</Label>
				<Input step={1} min={1} bind:value={amount} />
			</div>
			<input type="hidden" value={action.id} />
			<Button class="cursor-pointer disabled:cursor-not-allowed" disabled={!canAct} type="submit"
				>Add to Queue</Button
			>
		</form>
	</Dialog.Header>
</Dialog.Content>
