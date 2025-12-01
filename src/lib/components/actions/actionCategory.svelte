<script lang="ts">
	import { actionCategories, getAction, type Action as TypeAction } from '$lib/types/action';
	import Action from './action.svelte';
	import * as store from '$lib/store';

	let { category = $bindable() }: { category: string } = $props();
	const categoryArray = $derived(actionCategories[category] ?? []);
</script>

<div class="grid w-full grid-cols-8 gap-2 overflow-y-scroll">
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
