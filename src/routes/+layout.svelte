<script lang="ts">
	import '../app.css';
	import '../ui.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Equipment, initializeItemRegistry, Inventory } from '$lib/types/item';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';
	import { gameState, type Profile, sidebar } from '$lib/store.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Resizable from '$lib/components/ui/resizable';
	import AppSidebar from '$lib/components/ui/sidebar.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import DarkModeButton from '$lib/components/ui/darkModeButton.svelte';
	import WebsocketManager from '$lib/components/auth/websocketManager.svelte';
	import Chat from '$lib/components/ui/chat/chat.svelte';

	let { data, children }: { data: PageData; children: any } = $props();

	initializeItemRegistry();
	let inv: Inventory = Inventory.load(data.inventory);
	let eq: Equipment = Equipment.load(data.equipment);
	let user: User | null = data.user;
	let profile: Profile | null = data.profile;

	gameState.equipment = eq;
	gameState.user = user;
	gameState.profile = profile;
	gameState.inventory = inv;
</script>

<svelte:head>
	<link rel="icon" href="/images/items/weapons/swords/ironSword.svg" />
</svelte:head>

<ModeWatcher />
<Toaster position="bottom-right" richColors />
<DarkModeButton />
<WebsocketManager user={user as User} />

<Sidebar.Provider class="size-full bg-background text-foreground" bind:open={sidebar.open}>
	<AppSidebar />
	<Sidebar.Trigger />

	<Resizable.PaneGroup direction="horizontal" class="size-full" autoSaveId="mainContentPaneGroup">
		<Resizable.Pane defaultSize={75} minSize={60}>
			{@render children?.()}
		</Resizable.Pane>

		<Resizable.Handle />

		<Resizable.Pane defaultSize={25} minSize={20} maxSize={40}>
			<Chat />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</Sidebar.Provider>
