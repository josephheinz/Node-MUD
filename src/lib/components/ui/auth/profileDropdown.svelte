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

	let { profile }: { profile: Profile } = $props();

	async function signout() {
		fetch('/api/auth/signout', { method: 'POST' }).then(async (response) => {
			let json = await response.json();
			if (!response.ok) {
				throw new Error('HTTP error! status:', json.msg);
			}
			window.location.reload();
		});
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="select-none">
		<Button
			variant="outline"
			size="lg"
			class="flex w-full cursor-pointer items-center justify-start gap-2 px-2"
		>
			<UserAvatar {profile} />
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
			<DropdownMenu.Item onclick={signout} class="flex items-center gap-2" variant="destructive">
				<Fa icon={faArrowRightFromBracket} /> Sign Out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
