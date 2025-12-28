<script lang="ts">
	import '../app.css';
	import '../ui.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as context from '$lib/context';
	import { onMount } from 'svelte';
	import { Equipment, initializeItemRegistry, Inventory } from '$lib/types/item';
	import type { PageData } from './$types';
	import type { User } from '@supabase/supabase-js';
	let { data, children }: { data: PageData; children: any } = $props();

	initializeItemRegistry();

	let inv: Inventory = $state(Inventory.load(data.inventory));
	let eq: Equipment = $state(Equipment.load(data.equipment));
	let user: User | null = $state(data.user);
	let profile: context.Profile | null = $state(data.profile);

	onMount(() => {
		context.inventoryContext.set(inv);
		context.equipmentContext.set(eq);
		if (user) {
			console.log(user);
			context.userContext.set(user);
		}
		if (profile) context.profileContext.set(profile);
	});
</script>

<svelte:head>
	<link rel="icon" href="/images/items/weapons/swords/ironSword.svg" />
</svelte:head>

<ModeWatcher />

<div class="size-full bg-background text-foreground">
	{@render children?.()}
</div>
