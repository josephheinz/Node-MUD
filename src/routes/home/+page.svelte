<script lang="ts">
	import { tab } from '$lib/store.svelte';
	import Inventory from '$lib/components/ui/character/inventory.svelte';
	import HomeScreen from '$lib/components/ui/homeScreen.svelte';
	import Equipment from '$lib/components/ui/character/equipment.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import Chat from '$lib/components/ui/chat/chat.svelte';
	import Actions from '$lib/components/ui/action/actions.svelte';
	import SkillMenu from '$lib/components/ui/skills/skillMenu.svelte';
	import Forge from '$lib/components/ui/forge/forge.svelte';
	import Combat from '$lib/components/ui/combat/combat.svelte';

	let currentTab = $derived(tab.tab);

	$effect(() => {
		currentTab = tab.tab;
	});
</script>

<Resizable.PaneGroup direction="horizontal" class="size-full" autoSaveId="mainContentPaneGroup">
	<Resizable.Pane defaultSize={75} minSize={60}>
		<div class="flex h-full items-start justify-start p-4 relative">
			{#if currentTab === 'Home'}
				<HomeScreen />
			{:else if currentTab === 'Inventory'}
				<Inventory />
			{:else if currentTab === 'Equipment'}
				<Equipment />
			{:else if currentTab === 'Actions'}
				<Actions />
			{:else if currentTab === 'Skills'}
				<SkillMenu />
			{:else if currentTab === 'Forge'}
				<Forge />
			{:else if currentTab === 'Combat'}
				<Combat />
			{/if}
		</div>
	</Resizable.Pane>

	<Resizable.Handle />

	<Resizable.Pane defaultSize={25} minSize={20} maxSize={40}>
		<Chat />
	</Resizable.Pane>
</Resizable.PaneGroup>
