<script lang="ts">
	import LoginDialog from '$lib/components/ui/auth/loginDialog.svelte';
	import DarkModeButton from '$lib/components/ui/darkModeButton.svelte';
	import ItemRenderer from '$lib/components/ui/itemRenderer.svelte';
	import { Rarity } from '$lib/types/item';
	import * as context from '$lib/context';
	import type { User } from '@supabase/supabase-js';

	let user: User | undefined = $derived(context.userContext.getOr(undefined));
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
{user}
{#if user}
	{user.email}
{:else}
	<LoginDialog />
{/if}
