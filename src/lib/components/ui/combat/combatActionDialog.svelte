<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { enterCombatInstance } from '$lib/remote/combat.remote';
	import { getSkills } from '$lib/remote/skills.remote';
	import type { CombatAction } from '$lib/types/combatAction';
	import type { EnemyDrops } from '$lib/types/enemy';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import { getCombatEnemy, getEnemy } from '$lib/utils/enemy';
	import { xpToLevel } from '$lib/utils/skills';
	import type { UUID } from 'node:crypto';
	import Button from '../button/button.svelte';
	import EnemyHover from './enemyHover.svelte';
	import ItemHover from '../chat/itemHover.svelte';
	import { getItem } from '$lib/utils/item';
	import numeral from 'numeral';

	const { action, actionSelected }: { action: CombatAction; actionSelected: () => void } = $props();

	let skills: Record<SkillKey, Skill> = await getSkills();

	let actionSkill: Skill = $derived(skills[action.requirement?.name as SkillKey]);

	let dropsLists: Array<EnemyDrops[]> = $derived.by(() => {
		let drops: Array<EnemyDrops[]> = [];
		action.enemies.forEach((e) => {
			const enemy = getEnemy(e.id)!;
			drops.push(enemy.drops);
			console.log(JSON.stringify(drops));
		});
		return drops;
	});
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
	<div class="select-none">
		<h1 class="text-start text-lg font-semibold">Enemies:</h1>
		<ul class="flex flex-col items-start justify-start gap-2 p-2">
			{#each action.enemies as enemy, index}
				<li class="flex items-center justify-evenly gap-2">
					<EnemyHover enemy={getEnemy(enemy.id)!} amount={enemy.amount} />
					<div class="flex flex-col items-start justify-start gap-1.5">
						<span>Drops:</span><br />
						{#each dropsLists[index] as drops}
							{#each drops.items as item}
								<div class="flex items-center justify-evenly gap-1">
									{#if item.min == item.max}
										<span>{item.max}</span>
									{:else}
										<span>{item.min} - {item.max}</span>
									{/if}
									<ItemHover item={getItem(item.id)!} />
									<span
										>{item.chance ? `${numeral(1 / item.chance).format('0[.]000%')}` : ''}</span
									>
								</div>
							{/each}
						{/each}
					</div>
				</li>
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
