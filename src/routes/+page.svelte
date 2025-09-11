<script lang="ts">
	import { page } from '$app/state';

	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import type { Item } from '$lib/items';
	import { onMount } from 'svelte';

	let loginModalOpen = $state(false);
	let user = $state(page.data.user);
	let inventory: Item[] = $state([]);

	onMount(async () => {
		const res = await fetch(`/api/inventory/${user.id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJson;
			})
			.then((data) => {
				console.log('Success:', data);
				window.location.reload();
			})
			.catch((error) => {
				console.error(error);
			});
	});
</script>

{#if user}
	<ProfileDropdown {user} />
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
