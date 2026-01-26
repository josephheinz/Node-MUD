<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { getSkills } from '$lib/remote/skills.remote';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import { formatNumber } from '$lib/utils/general';
	import { cumulativeXPForLevel, xpForLevel, xpToLevel } from '$lib/utils/skills';
	import Progress from '../progress/progress.svelte';
	import Skeleton from '../skeleton/skeleton.svelte';

	const { skills }: { skills: Record<SkillKey, Skill> } = $props();
</script>

<svelte:boundary>
	{#snippet pending()}
		<Card.Root>
			<Card.Header>Loading...</Card.Header>
			<Card.Content>
				<div class="grid w-full grow grid-cols-3 grid-rows-3 gap-2">
					{#each { length: 9 }}
						<Skeleton class="size-16 rounded-md" />
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/snippet}

	<Card.Root>
		<Card.Header>Skills</Card.Header>
		<Card.Content>
			<div class="grid w-full grow grid-cols-3 grid-rows-3 gap-2">
				{#each Object.values(skills) as skill}
					{@const xpReqForLevel: number = xpForLevel(xpToLevel(skill.xp) + 1)}
					{@const xpOutOfCurrentLevel: number = skill.xp - cumulativeXPForLevel(xpToLevel(skill.xp))}
					<div class="flex aspect-square flex-col items-center justify-start p-2">
						<h2 class="text-lg font-medium">
							{skill.name}
						</h2>
						<h1 class="text-center font-black" title={`Total XP: ${formatNumber(skill.xp)}`}>
							{xpToLevel(skill.xp)}
						</h1>
						<Progress max={xpReqForLevel} value={Math.min(xpOutOfCurrentLevel, xpReqForLevel)} />
						<span
							title={`${formatNumber(xpOutOfCurrentLevel)} / ${formatNumber(xpReqForLevel)} to get to level ${xpToLevel(skill.xp) + 1}`}
							>{formatNumber(xpOutOfCurrentLevel)} / {formatNumber(xpReqForLevel)}</span
						>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</svelte:boundary>
