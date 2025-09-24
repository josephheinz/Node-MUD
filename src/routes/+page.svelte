<script lang="ts">
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import { type Equipment } from '$lib/types';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import type { Item } from '$lib/items';
	import CharacterMenu from '$lib/components/character/characterMenu.svelte';
	import { type StatList } from '$lib/stats';
	import Reforger from '$lib/components/reforger.svelte';

	let loginModalOpen = $state(false);

	let user = $state(get(store.user));
	let inventory = $state<Item[]>(get(store.inventory));
	let equipment = $state<Equipment>(get(store.equipment));
	let stats = $state<StatList>(get(store.modifiedStats)); // not base because base only gets updated when character upgrades are made

	store.inventory.subscribe((value) => {
		inventory = value;
	});

	store.user.subscribe((value) => {
		user = value;
	});

	store.equipment.subscribe((value) => {
		equipment = value;
	});

	store.modifiedStats.subscribe((value) => {
		stats = value;
	});
</script>

{#if user}
	<ProfileDropdown {user} />
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
<br />
{#if inventory && equipment}
	<CharacterMenu {inventory} {equipment} {stats} />
{/if}
<br />
<Reforger selectedItem={undefined} {equipment} {inventory} />
