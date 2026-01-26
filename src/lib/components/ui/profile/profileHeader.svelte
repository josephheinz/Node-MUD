<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import UserAvatar from '../userAvatar.svelte';
	import { BadgeReferences } from '$lib/utils/chat';
	import { capitalizeFirstLetter } from '$lib/utils/general';

	let { profile = $bindable() }: { profile: Profile } = $props();
</script>

<header class="w-full">
	<div class="relative h-56">
		<div class="h-56 overflow-hidden rounded-b-2xl" style="clip-path:url(#avatar-dip)">
			<img
				src={profile.banner_picture ?? 'https://placehold.co/1280x720'}
				class="h-full w-full object-cover"
				alt="Banner"
			/>
		</div>

		<div class="absolute bottom-0 left-8 z-10 translate-y-1/2">
			<UserAvatar {profile} class="size-32 object-cover shadow-xl" />
		</div>
	</div>

	<div class="grid grid-cols-[8rem_1fr] gap-6 p-4">
		<div></div>
		<div>
			<h1 class="flex items-center justify-start gap-3 text-2xl font-bold">
				{profile.display_name ?? profile.username}
				<span class="flex items-center justify-evenly gap-1.5 text-xl">
					{#each profile.badges as badge}
						{@const Icon = BadgeReferences[badge].icon}
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger><Icon color={BadgeReferences[badge].color} /></Tooltip.Trigger>
								<Tooltip.Content>
									<span>{capitalizeFirstLetter(badge)}</span>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					{/each}
				</span>
			</h1>
			<p class="max-w-lg text-muted-foreground">@{profile.username}</p>
		</div>
	</div>
</header>
