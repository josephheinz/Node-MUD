<script lang="ts">
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import { type Equipment } from '$lib/types/equipment';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import { type Item } from '$lib/types/item';
	import CharacterMenu from '$lib/components/character/characterMenu.svelte';
	import { getModifiedStats, type StatList } from '$lib/types/stats';
	import Reforger from '$lib/components/reforger.svelte';
	import Chat from '$lib/components/chat/chat.svelte';
	import { type User } from '@supabase/supabase-js';
	import Action from '$lib/components/actions/action.svelte';
	import { type DBQueueAction } from '$lib/types/action';
	import Queue from '$lib/components/actions/queue.svelte';

	let loginModalOpen = $state(false);

	let user = $state<User>(get(store.user));
	let inventory = $state<Item[]>(get(store.inventory));
	let equipment = $state<Equipment>(get(store.equipment));
	let stats = $state<StatList>(get(store.modifiedStats)); // not base because base only gets updated when character upgrades are made
	let queue = $state<DBQueueAction[]>(get(store.actionQueue));

	store.inventory.subscribe((value) => {
		inventory = value;
		store.modifiedStats.set(getModifiedStats(get(store.baseStats), get(store.equipment)));
	});

	store.user.subscribe((value) => {
		user = value;
	});

	store.equipment.subscribe((value) => {
		equipment = value;
		store.modifiedStats.set(getModifiedStats(get(store.baseStats), equipment));
	});

	store.modifiedStats.subscribe((value) => {
		stats = value;
	});

	store.actionQueue.subscribe((value) => {
		queue = value;
	});
</script>

<div class="top-30 right-10 z-0 flex items-start justify-start">
	{#if user}
		<ProfileDropdown {user} />
		<Chat {user} />
	{:else}
		<LoginButton onclick={() => (loginModalOpen = true)} />
		<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
	{/if}
	<br />
	{#if inventory && equipment}
		<CharacterMenu {inventory} {equipment} {stats} />
	{/if}
	<Reforger item={undefined} {equipment} {inventory} />
	<Action action={'test_action'} amount={1} />
	<Queue {queue} />
</div>
