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
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

	let { children }: { children: any } = $props();

	initializeItemRegistry();
	initializeActionRegistry();
</script>

<svelte:boundary>
	{#snippet pending()}
		<div></div>
	{/snippet}
	<WebsocketManager user={await getUser()} />
</svelte:boundary>

<svelte:boundary>
	{#snippet pending()}
		<div class="absolute flex size-full flex-col items-center justify-center gap-8 bg-background">
			<h1 class="text-4xl font-black">Loading</h1>
			<Spinner class="size-12" />
		</div>
	{/snippet}
	<Sidebar.Provider
		class="relative size-full overflow-hidden bg-background text-foreground"
		bind:open={sidebar.open}
	>
		<AppSidebar />

		<div class="relative w-full">
			<Sidebar.Trigger class="absolute z-10" />
			{@render children?.()}
		</div>
	</Sidebar.Provider>
</svelte:boundary>
