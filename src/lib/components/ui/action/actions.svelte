<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		type ActionCategory as TActionCategory,
		actionCategories,
		initializeActionRegistry
	} from '$lib/types/action';
	import ActionCategory from './actionCategory.svelte';
	import * as Empty from '$lib/components/ui/empty';
	import Fa from 'svelte-fa';
	import { faShapes } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { Shapes } from '@lucide/svelte';
	import CombatActions from './combatActions.svelte';

	const categories: TActionCategory[] = Object.keys(actionCategories);
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
	<Tabs.Root value="actions" class="grow">
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
						<Shapes size="48" />
					</Empty.Media>
					<Empty.Title>No actions available</Empty.Title>
					<Empty.Description>Click a tab to get started with actions</Empty.Description>
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
		{#if category === 'Combat'}
			<CombatActions />
		{:else}
			<ActionCategory {category} />
		{/if}
	</Tabs.Content>
{/snippet}
