<script lang="ts">
	import { actionCategories, getAction, type Action as TypeAction } from '$lib/types/action';
	import type { Item } from '$lib/types/item';
	import Action from './action.svelte';

	const { category, inventory }: { category: string; inventory: Item[] } = $props();
	const categoryArray = actionCategories[category] ?? [];
</script>

<div class="grid grid-cols-6 gap-2 overflow-y-scroll">
	{#each categoryArray as actionName, index}
		{@const action: TypeAction | null = getAction(actionName)}
		{#if action}
			<Action action={actionName} amount={1} {inventory} />
		{/if}
	{/each}
</div>
