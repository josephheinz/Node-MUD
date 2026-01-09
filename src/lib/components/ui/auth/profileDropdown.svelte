<script lang="ts">
	import * as Avatar from '../avatar';
	import * as DropdownMenu from '../dropdown-menu';
	import type { Profile } from '$lib/store.svelte';
	import Fa from 'svelte-fa';
	import {
		faArrowRightFromBracket,
		faMoon,
		faSort,
		faSun,
		faUser
	} from '@fortawesome/free-solid-svg-icons';
	import { Button } from '../button/index';
	import ChevronUpDown from '../chevronUpDown.svelte';
	import UserAvatar from '../userAvatar.svelte';
	import { toggleMode, mode } from 'mode-watcher';
	import { capitalizeFirstLetter } from '$lib/utils/general';
	import { getProfile, logout } from '$lib/remote/auth.remote';
	import { toast } from 'svelte-sonner';
</script>

<svelte:boundary>
	{#snippet pending()}
		<span>Loading</span>
	{/snippet}
	{@const profile = await getProfile()}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="select-none">
			<Button
				variant="outline"
				size="lg"
				class="flex w-full cursor-pointer items-center justify-start gap-2 px-2"
			>
				<UserAvatar />
				<span class="grow text-left">
					{profile.display_name ?? `@${profile.username}`}
				</span>
				<ChevronUpDown />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Label>Your Account</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<a href={`/profile/${profile.username}`} class="flex items-center gap-2">
						<Fa icon={faUser} />Profile
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={toggleMode}>
					<Fa icon={mode.current === 'dark' ? faMoon : faSun} />
					{capitalizeFirstLetter(mode.current ?? 'system')}
				</DropdownMenu.Item>
				<form
					{...logout.enhance(async ({ submit }) => {
						try {
							await submit();
							location.href = '/';
						} catch (e) {
							toast.error('Something went wrong logging out');
						}
					})}
				>
					<button type="submit" class="w-full">
						<DropdownMenu.Item class="flex items-center gap-2" variant="destructive">
							<Fa icon={faArrowRightFromBracket} /> Sign Out
						</DropdownMenu.Item>
					</button>
				</form>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</svelte:boundary>
