<script lang="ts">
	import { actionCategories, getAction, type Action as TypeAction } from '$lib/types/action';
	import Action from './action.svelte';
	import * as store from '$lib/store';
	import { get } from 'svelte/store';
	import { cumulativeXPForLevel, xpToLevel, type Skill, type SkillKey } from '$lib/types/skills';

	let { category = $bindable() }: { category: string } = $props();
	const categoryArray = $derived(actionCategories[category] ?? []);

	let skills: Record<SkillKey, Skill> = get(store.skills);
</script>

<div class="grid w-full grid-cols-4 gap-2 overflow-y-scroll lg:grid-cols-6 xl:grid-cols-8">
	{#each categoryArray as actionName, index}
		{@const action: TypeAction | null = getAction(actionName)}
		<!--Yikes, just checks whether or not the player's current level is higher than the required level-->
		{@const usuable: boolean = action ? (action.requirement ? xpToLevel(skills[action.requirement.name as SkillKey].xp) >= action.requirement.xp : true) : false}
		{#if action}
			<!-- 			<span>{usuable}</span>
 -->
			<Action
				{usuable}
				action={actionName}
				onclick={() => {
					store.actionModalData.set({ action: actionName, visible: true, amount: 1 });
				}}
			/>
		{/if}
	{/each}
</div>
