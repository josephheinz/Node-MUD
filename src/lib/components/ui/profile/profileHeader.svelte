<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import UserAvatar from '../userAvatar.svelte';

	const { profile }: { profile: Profile } = $props();
</script>

<header class="w-full">
	<div class="relative h-56">
		<div class="h-56 overflow-hidden rounded-b-2xl" style="clip-path:url(#avatar-dip)">
			<img src="https://placehold.co/1280x720" class="h-full w-full object-cover" alt="Banner" />
		</div>

		<div class="absolute bottom-0 left-8 z-10 translate-y-1/2">
			<UserAvatar {profile} class="size-32 object-cover shadow-xl" />
		</div>
	</div>

	<div class="grid grid-cols-[8rem_1fr] gap-6 p-4">
		<div></div>
		<div>
			<h1 class="text-2xl font-bold">{profile.display_name ?? profile.username}</h1>
			<p class="max-w-lg text-muted-foreground">@{profile.username}</p>
		</div>
	</div>
</header>
