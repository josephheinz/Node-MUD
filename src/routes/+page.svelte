<script lang="ts">
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import { type Equipment } from '$lib/types';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import { type Item } from '$lib/items';
	import CharacterMenu from '$lib/components/character/characterMenu.svelte';
	import { getModifiedStats, type StatList } from '$lib/stats';
	import Reforger from '$lib/components/reforger.svelte';
	import ProgressBar from '$lib/components/actions/progressBar.svelte';
	import Action from '$lib/components/actions/action.svelte';
	import type { Action as IAction } from '$lib/types';
	import Chat from '$lib/components/chat/chat.svelte';
	import { type User } from '@supabase/supabase-js';

	let loginModalOpen = $state(false);

	let user = $state<User>(get(store.user));
	let inventory = $state<Item[]>(get(store.inventory));
	let equipment = $state<Equipment>(get(store.equipment));
	let stats = $state<StatList>(get(store.modifiedStats)); // not base because base only gets updated when character upgrades are made

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

	let testAction: IAction = $state({ value: 10, max: 100, name: 'test action' });

	setInterval(() => {
		if (testAction.value < testAction.max) testAction.value += Math.random();
		else testAction.value = 0;
	}, 50);
</script>

{#if user}
	<ProfileDropdown {user} />
	<Chat {user}/>
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
<br />
{#if inventory && equipment}
	<CharacterMenu {inventory} {equipment} {stats} />
{/if}
<div class="absolute top-30 right-10 z-0 flex">
	<Reforger item={undefined} {equipment} {inventory} />
	<Action action={testAction} />
</div>
