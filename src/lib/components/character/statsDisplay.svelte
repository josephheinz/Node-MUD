<script lang="ts">
	import { StatIcons, type StatList } from '$lib/types/stats';
	import { capitalizeAfterSpaces } from '$lib/utils/general';

	const { stats }: { stats: StatList } = $props();
</script>

<div class="m-2 h-full w-96 gap-2">
	{#each Object.entries(stats) as [name, value] (name)}
		<p class="text-lg">{StatIcons[name]} {capitalizeAfterSpaces(name)}: {value}</p>
	{/each}
</div>
