<script lang="ts">
	import '../app.css';
	import '../ui.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { Equipment, initializeItemRegistry, Inventory } from '$lib/types/item';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';
	import { gameState, type Profile, sidebar } from '$lib/store.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/ui/sidebar.svelte';

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

<Sidebar.Provider class="size-full bg-background text-foreground" bind:open={sidebar.open}>
	<AppSidebar />
	<main>
		<Sidebar.Trigger />
		{@render children?.()}
	</main>
</Sidebar.Provider>
