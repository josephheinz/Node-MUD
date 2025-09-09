<script lang="ts">
	import { page } from '$app/state';
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';

	let loginModalOpen = $state(false);
	let user = $state(page.data.user);
</script>

{#if user}
	<p>hello {user?.email}</p>
{:else}
	<LoginButton onclick={() => (loginModalOpen = true)} />
	<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
{/if}
