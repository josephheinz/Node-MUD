<script lang="ts">
	import '../app.css';
	import '../ui.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Equipment, initializeItemRegistry, Inventory } from '$lib/types/item';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';
	import { gameState, type Profile, sidebar } from '$lib/store.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/ui/sidebar.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import WebsocketManager from '$lib/components/auth/websocketManager.svelte';
	import { initializeActionRegistry, type DBQueueAction } from '$lib/types/action';

	let { data, children }: { data: PageData; children: any } = $props();

	initializeItemRegistry();
	initializeActionRegistry();
	let inv: Inventory = Inventory.load(data.inventory);
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
	$inspect(gameState);
</script>

<svelte:head>
	<link rel="icon" href="/images/items/weapons/swords/ironSword.svg" />
</svelte:head>

<ModeWatcher />
<Toaster position="bottom-right" richColors />
<!-- <DarkModeButton />
 --><WebsocketManager user={user as User} />

<Sidebar.Provider class="relative size-full bg-background text-foreground" bind:open={sidebar.open}>
	<AppSidebar />

	<div class="relative w-full">
		<Sidebar.Trigger class="absolute z-10 " />
		{@render children?.()}
	</div>
</Sidebar.Provider>
