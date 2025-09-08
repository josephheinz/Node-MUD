<script lang="ts">
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';

	let loginModalOpen = $state(false);
</script>

<LoginButton onclick={() => (loginModalOpen = true)} />
<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
