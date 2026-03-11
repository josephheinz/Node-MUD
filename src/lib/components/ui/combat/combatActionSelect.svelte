<script lang="ts">
	import { combatActionCategories, initializeActionRegistry } from '$lib/types/action';
	import { onMount } from 'svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { CombatCategory } from '$lib/types/action';
	import * as Empty from '$lib/components/ui/empty';
	import { Swords } from '@lucide/svelte';
	import CombatActionCategory from './combatActionCategory.svelte';

	const { actionSelected }: { actionSelected: () => void } = $props();

	const categories: CombatCategory[] = Object.keys(combatActionCategories);
	let selectedTab = $state<string | null>(null);
	let anyActive = $derived(selectedTab !== null);

	function selectTab(tabId: string) {
		anyActive = true;
		selectedTab = tabId;
	}

	onMount(() => {
		initializeActionRegistry();
	});
</script>

<div class="flex size-full flex-col gap-6">
	<Tabs.Root value="combat-actions" class="grow">
		<Tabs.List>
			{#each categories as cat}
				{@render ActionTab(cat)}
			{/each}
		</Tabs.List>
		{#each categories as cat}
			{@render ActionCat(cat)}
		{/each}
		{#if !anyActive}
			<Empty.Root>
				<Empty.Header>
					<Empty.Media>
						<Swords size="48" />
					</Empty.Media>
					<Empty.Title>No actions available</Empty.Title>
					<Empty.Description>Click a tab to get started with combat</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Tabs.Root>
</div>

{#snippet ActionTab(category: string)}
	<Tabs.Trigger value={category} class="p-4" onclick={() => selectTab(category)}
		>{category}</Tabs.Trigger
	>
{/snippet}

{#snippet ActionCat(category: string)}
	<Tabs.Content value={category} class="h-full grow">
		<CombatActionCategory {category} {actionSelected} />
	</Tabs.Content>
{/snippet}
