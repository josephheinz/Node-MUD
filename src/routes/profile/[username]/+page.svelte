<script lang="ts">
	import * as Empty from '$lib/components/ui/empty';
	import ProfileHeader from '$lib/components/ui/profile/profileHeader.svelte';
	import ProfileBody from '$lib/components/ui/profile/profileBody.svelte';
	import { page } from '$app/state';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { Skull } from '@lucide/svelte';
	import { getProfilePage } from '$lib/remote/profile.remote';

	let data = await getProfilePage(page.params.username!);

	let profile = $derived(data.profile);
	let apiSettings = $derived(data.apiSettings);
	let equipment = $derived(data.equipment);
	let inventory = $derived(data.inventory);
	let user = $derived(data.isUser);

	let username: string = $derived(page.params.username ?? '');
</script>

<svelte:boundary>
	{#snippet pending()}
		<title>Loading...</title>
		<div class="absolute flex size-full flex-col items-center justify-center gap-8 bg-background">
			<h1 class="text-4xl font-black">Loading</h1>
			<Spinner class="size-12" />
		</div>
	{/snippet}
	<title>{profile?.display_name ?? `@${profile?.username}`}'s Profile</title>

	{#if profile}
		<ProfileHeader {profile} owner={user} />
		<ProfileBody {data} />
	{:else}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media>
					<Skull size="36" />
				</Empty.Media>
				<Empty.Title>This profile does not exist</Empty.Title>
				<Empty.Description>Are you sure you spelled it right?</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
</svelte:boundary>
