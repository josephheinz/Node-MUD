<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Profile } from '$lib/store.svelte';
	import Input from '../input/input.svelte';
	import Label from '../label/label.svelte';
	import Separator from '../separator/separator.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { updateProfileSettings } from '$lib/remote/profile.remote';
	import type { SvelteComponent } from 'svelte';
	import { toast } from 'svelte-sonner';

	let { profile }: { profile: Profile } = $props();

	let bannerInput: SvelteComponent | undefined;
	let bannerVal = $derived(bannerInput?.value ?? profile.banner_picture);
	let pfpVal = $state(profile.profile_picture);
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title>Settings</Dialog.Title>
	</Dialog.Header>
	<form
		{...updateProfileSettings.enhance(async ({ form, data, submit }) => {
			try {
				await submit();
				toast.success('Successfully updated your profile');
				window.location.reload();
			} catch (err) {
				toast.error('There was an error');
			}
		})}
		class="flex flex-col items-end justify-evenly gap-4"
	>
		<section class="flex w-full items-stretch justify-evenly gap-2">
			<img
				src={bannerVal.trim() != '' ? bannerVal : 'https://placehold.co/1280x720'}
				class="aspect-video w-1/3 rounded-sm"
				alt="Banner"
			/>
			<div class="flex grow flex-col items-start justify-start gap-0.25">
				<Label for="banner" class="text-lg font-semibold">Profile Banner:</Label>
				<Input
					placeholder="https://placehold.co/1280x720"
					oninput={(e) => (bannerVal = e.currentTarget.value)}
					{...updateProfileSettings.fields.banner_picture.as('url')}
					value={profile.banner_picture}
				/>
			</div>
		</section>
		<Separator />
		<section class="flex w-full items-stretch justify-evenly gap-2">
			<Avatar.Root class="size-32">
				<Avatar.AvatarImage src={pfpVal} />
				<Avatar.AvatarFallback>
					{profile.display_name
						? profile.display_name.substring(0, 2)
						: profile.username.substring(0, 2)}
				</Avatar.AvatarFallback>
			</Avatar.Root>
			<div class="flex grow flex-col items-start justify-start gap-0.5">
				<Label for="pfp" class="text-lg font-semibold">Profile Picture:</Label>
				<Input
					placeholder="https://placehold.co/1080x1080"
					oninput={(e) => (pfpVal = e.currentTarget.value)}
					{...updateProfileSettings.fields.profile_picture.as('url')}
					value={profile.profile_picture}
				/>
			</div>
		</section>
		<Separator />
		<section class="flex w-full items-stretch justify-evenly gap-2">
			<div class="flex grow flex-col items-start justify-start gap-0.5">
				<Label for="displayName" class="text-lg font-semibold">Display Name:</Label>
				<Input
					placeholder="gabagool"
					{...updateProfileSettings.fields.display_name.as('text')}
					value={profile.display_name}
				/>
			</div>
		</section>
		<Input type="submit" value="Save Changes" />
	</form>
</Dialog.Content>
