<script lang="ts">
	import {
		cumulativeXPForLevel,
		xpForLevel,
		xpToLevel,
		type Skill,
		type SkillKey
	} from '$lib/types/skills';
	import numeral from 'numeral';
	import ProgressBar from '../actions/progressBar.svelte';

	let { skills = $bindable() }: { skills: Record<SkillKey, Skill> } = $props();
</script>

<main class="flex h-full w-full items-start justify-start p-4 select-none">
	<div
		class="flex flex-col items-start justify-start gap-2 rounded-md border-2 border-zinc-700 bg-zinc-800 p-2"
	>
		<h1 class="text-2xl font-semibold">Your Skills</h1>
		<div class="grid w-full grow grid-cols-3 grid-rows-3 gap-2">
			{#each Object.values(skills) as skill}
				{@const xpReqForLevel: number = xpForLevel(xpToLevel(skill.xp) + 1)}
				{@const xpOutOfCurrentLevel: number = skill.xp - cumulativeXPForLevel(xpToLevel(skill.xp))}
				<div class="flex aspect-square flex-col items-center justify-start p-2">
					<h2 class="text-lg font-medium">
						{skill.name}
					</h2>
					<span
						class="text-center text-2xl font-black"
						title={`Total XP: ${numeral(skill.xp).format('0,0[.]00A')}`}>{xpToLevel(skill.xp)}</span
					>
					<ProgressBar max={xpReqForLevel} value={Math.min(xpOutOfCurrentLevel, xpReqForLevel)} />
					<span
						title={`${numeral(xpOutOfCurrentLevel).format('0,0[.]00A')} / ${numeral(
							xpReqForLevel
						).format('0,0[.]00A')} to get to level ${xpToLevel(skill.xp) + 1}`}
						>{numeral(xpOutOfCurrentLevel).format('0,0[.]00a')} / {numeral(xpReqForLevel).format(
							'0,0[.]00a'
						)}</span
					>
				</div>
			{/each}
		</div>
	</div>
</main>
