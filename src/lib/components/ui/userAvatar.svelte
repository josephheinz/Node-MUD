<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import * as Avatar from './avatar';

	const {
		profile,
		class: userClass = '',
		...restProps
	}: { profile: Profile; class?: string } = $props();
</script>

<Avatar.Root class={userClass} {...restProps}>
	<Avatar.AvatarImage src={profile.profile_picture} />
	<Avatar.AvatarFallback
		>{profile.display_name
			? profile.display_name.substring(0, 2)
			: profile.username.substring(0, 2)}</Avatar.AvatarFallback
	>
</Avatar.Root>
