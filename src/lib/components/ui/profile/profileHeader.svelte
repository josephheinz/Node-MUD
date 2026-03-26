<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import UserAvatar from '../userAvatar.svelte';
	import { BadgeReferences } from '$lib/utils/chat';
	import { capitalizeFirstLetter } from '$lib/utils/general';
	import { Pencil } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import SettingsDialog from './settingsDialog.svelte';

	let { profile = $bindable(), owner = false }: { profile: Profile; owner: boolean } = $props();

	let open = $state(false);

</script>

<header class="w-full">
	<Dialog.Root bind:open>
		<div class="relative h-56">
			<div class="group h-56 overflow-hidden rounded-b-2xl" style="clip-path:url(#avatar-dip)">
				<img
					src={profile.banner_picture ?? 'https://placehold.co/1280x720'}
					class="h-full w-full object-cover"
					alt="Banner"
				/>
				{#if owner}
					<button
						class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-b-2xl bg-black/40 opacity-0 transition-all duration-150 group-hover:opacity-100"
						onclick={() => (open = true)}
					>
						<Pencil />
					</button>
				{/if}
			</div>

			<div class="group relative top-0 left-8 z-10 w-max -translate-y-1/4">
				<UserAvatar {profile} class="size-32 object-cover shadow-xl" />
				{#if owner}
					<button
						class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-all duration-150 group-hover:opacity-100"
						onclick={() => (open = true)}
					>
						<Pencil />
					</button>
				{/if}
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
		<SettingsDialog {profile} />
	</Dialog.Root>
</header>
