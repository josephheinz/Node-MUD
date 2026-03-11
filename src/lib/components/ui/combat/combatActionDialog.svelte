<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { enterCombatInstance } from '$lib/remote/combat.remote';
	import { getSkills } from '$lib/remote/skills.remote';
	import type { CombatAction } from '$lib/types/combatAction';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import { getCombatEnemy, getEnemy } from '$lib/utils/enemy';
	import { xpToLevel } from '$lib/utils/skills';
	import Button from '../button/button.svelte';
	import EnemyHover from './enemyHover.svelte';

	const { action, actionSelected }: { action: CombatAction; actionSelected: () => void } = $props();

	let skills: Record<SkillKey, Skill> = await getSkills();

	let actionSkill: Skill = $derived(skills[action.requirement?.name as SkillKey]);
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title>{action.name}</Dialog.Title>
		{#if action.requirement}
			<span
				class={xpToLevel(actionSkill.xp) >= xpToLevel(action.requirement.xp)
					? 'text-muted-foreground'
					: 'text-rose-400'}
				>Requires Level {xpToLevel(action.requirement.xp)}
				{action.requirement.name}</span
			>
		{/if}
	</Dialog.Header>
	<div>
		<h1 class="text-start text-lg font-semibold">Enemies:</h1>
		<ul class="flex items-center justify-start gap-2 p-2">
			{#each action.enemies as enemy}
				<EnemyHover enemy={getEnemy(enemy.id)!} amount={enemy.amount} />
			{/each}
		</ul>
	</div>
	<Dialog.Footer>
		<Button
			onclick={() => {
				void enterCombatInstance(action.id).then(() => {
					actionSelected();
				});
			}}>Fight</Button
		>
	</Dialog.Footer>
</Dialog.Content>
