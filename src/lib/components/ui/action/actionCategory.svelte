<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { actionCategories, getAction, type Action, type ActionCategory } from '$lib/types/action';
	import ActionButton from './actionButton.svelte';
	import ActionDialog from './actionDialog.svelte';
	const { category: categoryName }: { category: ActionCategory } = $props();

	const category: string[] = actionCategories[categoryName];
	const actions: (Action | null)[] = category.map(getAction);

	let selectedAction: Action | undefined = $state();
</script>

<div class="grid h-full grid-cols-6 grid-rows-6 gap-4">
	<Dialog.Root>
		{#each actions as action}
			{#if action !== null}
				<Dialog.Trigger onclick={() => (selectedAction = action)}>
					<ActionButton {action} />
				</Dialog.Trigger>
			{/if}
		{/each}
		{#if selectedAction}
			<ActionDialog action={selectedAction} />
		{/if}
	</Dialog.Root>
</div>
