<script lang="ts">
	import { getProfile } from '$lib/remote/auth.remote';
	import type { Profile } from '$lib/store.svelte';
	import * as Avatar from './avatar';

	const {
		profile: customProfile,
		class: userClass = '',
		...restProps
	}: { class?: string; profile?: Profile } = $props();
</script>

<svelte:boundary>
	{#snippet pending()}
		<span>Loading</span>
	{/snippet}
	{@const profile = customProfile ? customProfile : await getProfile()}
	<Avatar.Root class={userClass} {...restProps}>
		<Avatar.AvatarImage src={profile.profile_picture} />
		<Avatar.AvatarFallback
			>{profile.display_name
				? profile.display_name.substring(0, 2)
				: profile.username.substring(0, 2)}</Avatar.AvatarFallback
		>
	</Avatar.Root>
</svelte:boundary>
