<script lang="ts">
	import { StatIcons, type StatList } from '$lib/stats';

	const { stats }: { stats: StatList } = $props();
</script>

<div class="m-2 h-full w-96 gap-2">
	{#each Object.entries(stats) as [name, value]}
		<p>{StatIcons[name]} {name}: {value.amount}</p>
	{/each}
</div>
