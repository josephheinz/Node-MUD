<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import type { IApiSettings } from './+layout.server';
	import * as Empty from '$lib/components/ui/empty';
	import Fa from 'svelte-fa';
	import { faSkull } from '@fortawesome/free-solid-svg-icons';
	import ProfileHeader from '$lib/components/ui/profile/profileHeader.svelte';
	import ProfileBody from '$lib/components/ui/profile/profileBody.svelte';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';

	const {
		data
	}: {
		data: {
			profile: Profile | undefined;
			api_settings: IApiSettings | undefined;
			user: User | null;
		};
	} = $props();

	let profile = $derived(data.profile);
	let apiSettings = $derived(data.api_settings);
</script>

<title>{profile?.display_name ?? `@${profile?.username}`}'s Profile</title>

{#if profile && apiSettings}
	<ProfileHeader bind:profile />
	<ProfileBody {data} />
{:else}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media>
				<Fa icon={faSkull} class="text-4xl" />
			</Empty.Media>
			<Empty.Title>This profile does not exist</Empty.Title>
			<Empty.Description>Are you sure you spelled it right?</Empty.Description>
		</Empty.Header>
	</Empty.Root>
{/if}
