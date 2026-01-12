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
	import { updateQueue } from '$lib/remote/actions.remote';
	import { onMount } from 'svelte';

	let { children }: { children: any } = $props();

	initializeItemRegistry();
	initializeActionRegistry();

	onMount(async () => {
		await updateQueue();
	});
</script>

<svelte:boundary>
	{#snippet pending()}
		<div></div>
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
