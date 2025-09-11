<script lang="ts">
	import ItemRenderer from './itemRenderer.svelte';

	const { inventory }: { inventory: Item[] } = $props();
</script>

<div class="inline-grid grid-cols-5 gap-2">
	{#each inventory as item}
		<ItemRenderer {item} mode={'ascii'} />
	{/each}
</div>
