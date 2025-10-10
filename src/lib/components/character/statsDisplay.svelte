<script lang="ts">
	import { StatIcons, type StatList } from '$lib/types/stats';

	const { stats }: { stats: StatList } = $props();

	function capitalizeAfterSpaces(str: String): String {
		return str.replace(/(^|\s)[a-z]/gi, (l) => l.toUpperCase());
	}
</script>

<div class="m-2 h-full w-96 gap-2">
	{#each Object.entries(stats) as [name, value] (name)}
		<p class="text-lg">{StatIcons[name]} {capitalizeAfterSpaces(name)}: {value}</p>
	{/each}
</div>