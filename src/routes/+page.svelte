<script lang="ts">
	import LoginDialog from '$lib/components/ui/auth/loginDialog.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import HomeScreen from '$lib/components/ui/homeScreen.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { getProfileOrUndefined } from '$lib/remote/auth.remote';
</script>

<div class="flex size-full flex-col items-center justify-center">
	<svelte:boundary>
		{#snippet pending()}
			<div class="absolute flex size-full flex-col items-center justify-center gap-8 bg-background">
				<h1 class="text-4xl font-black">Loading</h1>
				<Spinner class="size-12" />
			</div>
		{/snippet}
		{#if await getProfileOrUndefined()}
			<HomeScreen />
			<Button href="/home" variant="link">Continue to game</Button>
		{:else}
			<LoginDialog />
		{/if}
	</svelte:boundary>
</div>
