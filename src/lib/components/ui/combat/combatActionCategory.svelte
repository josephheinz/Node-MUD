<script lang="ts">
	import { getSkills } from '$lib/remote/skills.remote';
	import { combatActionCategories, getCombatAction, type CombatCategory } from '$lib/types/action';
	import type { CombatAction } from '$lib/types/combatAction';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import * as Dialog from '$lib/components/ui/dialog';
	import { xpToLevel } from '$lib/utils/skills';
	import CombatActionButton from './combatActionButton.svelte';
	import CombatActionDialog from './combatActionDialog.svelte';

	const {
		category: categoryName,
		actionSelected
	}: { category: CombatCategory; actionSelected: () => void } = $props();

	const category: string[] = combatActionCategories[categoryName];
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
					<CombatActionButton disabled={!usuable} {action} />
				</Dialog.Trigger>
			{/if}
		{/each}
		{#if selectedAction}
			<CombatActionDialog action={selectedAction} {actionSelected} />
		{/if}
	</Dialog.Root>
</div>
