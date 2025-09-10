<script lang="ts">
	import { page } from '$app/state';
	import { type Item, getItem } from '$lib/items';

	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import ItemRenderer from '$lib/components/itemRenderer.svelte';
	import { onMount } from 'svelte';

	let loginModalOpen = $state(false);
	let user = $state(page.data.user);
	let item: Item | undefined = $state(undefined);

	onMount(async () => {
		item = await getItem('gold_sword');
	});
</script>

{#if user}
	<ProfileDropdown {user} />
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
{#if item != undefined}
	<ItemRenderer {item} mode={'ascii'} />
{/if}
