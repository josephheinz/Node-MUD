<script lang="ts">
	import '../../app.css';
	import '../../ui.css';
	import { initializeItemRegistry } from '$lib/types/item';
	import { sidebar } from '$lib/store.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/ui/sidebar.svelte';
	import WebsocketManager from '$lib/components/auth/websocketManager.svelte';
	import { initializeActionRegistry } from '$lib/types/action';
	import { getUser } from '$lib/remote/auth.remote';

	let { children }: { children: any } = $props();

	initializeItemRegistry();
	initializeActionRegistry();
	/* let inv: Inventory = Inventory.load(data.inventory);
	let eq: Equipment = Equipment.load(data.equipment);
	let user: User | null = data.user;
	let profile: Profile | null = data.profile;
	let queue: DBQueueAction[] | null = data.queue;
	let started: Date | null = data.started;

	gameState.equipment = eq;
	gameState.user = user;
	gameState.profile = profile;
	gameState.inventory = inv;

	gameState.queue.started = started;
	gameState.queue.queue = queue;
	$inspect(gameState); */
</script>

<svelte:boundary>
	{#snippet pending()}
		<span>Loading</span>
	{/snippet}
	<WebsocketManager user={await getUser()} />
</svelte:boundary>

<Sidebar.Provider class="relative size-full bg-background text-foreground" bind:open={sidebar.open}>
	<AppSidebar />

	<div class="relative w-full">
		<Sidebar.Trigger class="absolute z-10" />
		{@render children?.()}
	</div>
</Sidebar.Provider>
