<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { getSkills } from '$lib/remote/skills.remote';
	import { actionCategories } from '$lib/types/action';
	import { getCombatAction, type CombatAction } from '$lib/types/combatAction';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import { xpToLevel } from '$lib/utils/skills';
	import ActionButton from './actionButton.svelte';
	import CombatActionDialog from './combatActionDialog.svelte';

	const categoryName = 'Combat';

	const category: string[] = actionCategories[categoryName];
	const actions: (CombatAction | null)[] = category.map(getCombatAction);

	let selectedAction: CombatAction | undefined = $state();
	let skills: Record<SkillKey, Skill> = await getSkills();
</script>

<div class="grid h-full grid-cols-6 grid-rows-6 gap-4">
	<Dialog.Root>
		{#each actions as action}
			{#if action !== null}
				{@const usuable: boolean = action ? (action.requirement ? xpToLevel(skills[action.requirement.name as SkillKey].xp) >= xpToLevel(action.requirement.xp) : true) : false}

				<Dialog.Trigger disabled={!usuable} onclick={() => (selectedAction = action)}>
					<ActionButton disabled={!usuable} {action} />
				</Dialog.Trigger>
			{/if}
		{/each}
		{#if selectedAction}
			<CombatActionDialog action={selectedAction} />
		{/if}
	</Dialog.Root>
</div>
