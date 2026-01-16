<script lang="ts">
	import {
		cumulativeXPForLevel,
		xpForLevel,
		xpToLevel,
		type Skill,
		type SkillKey
	} from '$lib/types/skills';
	import numeral from 'numeral';
	import ProgressBar from '../../actions/progressBar.svelte';
	import Container from '../../generic/container.svelte';
	import Heading from '../../generic/heading.svelte';
	import { formatNumber } from '$lib/utils/general';
	import FlexColContainer from '../../generic/flexContainers/flexColContainer.svelte';

	let { skills = $bindable() }: { skills: Record<SkillKey, Skill> } = $props();
</script>

<main class="flex h-full w-full items-start justify-start p-4 select-none">
	<FlexColContainer class="items-start justify-start">
		<Heading>Your Skills</Heading>
		<div class="grid w-full grow grid-cols-3 grid-rows-3 gap-2">
			{#each Object.values(skills) as skill}
				{@const xpReqForLevel: number = xpForLevel(xpToLevel(skill.xp) + 1)}
				{@const xpOutOfCurrentLevel: number = skill.xp - cumulativeXPForLevel(xpToLevel(skill.xp))}
				<div class="flex aspect-square flex-col items-center justify-start p-2">
					<h2 class="text-lg font-medium">
						{skill.name}
					</h2>
					<Heading class="text-center font-black" title={`Total XP: ${formatNumber(skill.xp)}`}
						>{xpToLevel(skill.xp)}</Heading
					>
					<ProgressBar max={xpReqForLevel} value={Math.min(xpOutOfCurrentLevel, xpReqForLevel)} />
					<span
						title={`${formatNumber(xpOutOfCurrentLevel)} / ${formatNumber(xpReqForLevel)} to get to level ${xpToLevel(skill.xp) + 1}`}
						>{formatNumber(xpOutOfCurrentLevel)} / {formatNumber(xpReqForLevel)}</span
					>
				</div>
			{/each}
		</div>
	</FlexColContainer>
</main>
