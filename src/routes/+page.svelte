<script lang="ts">
	import LoginDialog from '$lib/components/ui/auth/loginDialog.svelte';
	import DarkModeButton from '$lib/components/ui/darkModeButton.svelte';
	import ItemRenderer from '$lib/components/ui/itemRenderer.svelte';
	import { Rarity } from '$lib/types/item';
	import { gameState } from '$lib/store.svelte';
	import type { User } from '@supabase/supabase-js';
	import NavProfile from '$lib/components/ui/auth/navProfile.svelte';

	let user: User | null = $derived(gameState.user);
</script>

<ItemRenderer
	item={{
		uid: 'e',
		id: 'e',
		name: 'Test',
		rarity: Rarity.Rare,
		icon: '/images/items/purpleBook.png',
		modifiers: []
	}}
	equipFlags={{
		equippable: false
	}}
/>

<DarkModeButton />
<NavProfile />
