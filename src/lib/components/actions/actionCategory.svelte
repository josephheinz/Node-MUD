<script lang="ts">
	import { actionCategories, getAction, type Action as TypeAction } from '$lib/types/action';
	import Action from './action.svelte';
	import * as store from '$lib/store';

	let { category }: { category: string } = $props();
	const categoryArray = actionCategories[category] ?? [];
</script>

<div class="grid grid-cols-6 gap-2 overflow-y-scroll">
	{#each categoryArray as actionName, index}
		{@const action: TypeAction | null = getAction(actionName)}
		{#if action}
			<Action
				action={actionName}
				onclick={() => {
					store.actionModalData.set({ action: actionName, visible: true, amount: 1 });
				}}
			/>
		{/if}
	{/each}
</div>
