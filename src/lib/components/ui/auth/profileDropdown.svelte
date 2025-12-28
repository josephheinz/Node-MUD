<script lang="ts">
	import * as Avatar from '../avatar';
	import * as DropdownMenu from '../dropdown-menu';
	import type { Profile } from '$lib/store.svelte';
	import Fa from 'svelte-fa';
	import { faArrowRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
	import { Button } from '../button/index';

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
	<DropdownMenu.Trigger>
		<Button variant="outline" size="lg" class="flex items-center justify-start gap-2 px-2 min-w-24 max-w-30">
			<Avatar.Root>
				<Avatar.Image src={profile.profile_picture} alt={`@${profile.username}`} />
				<Avatar.Fallback>{profile.display_name.substring(0, 2)}</Avatar.Fallback>
			</Avatar.Root>
			<span>
				{profile.display_name ?? `@${profile.username}`}
			</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>Your Account</DropdownMenu.Label>
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<a href="#" class="flex items-center gap-2">
					<Fa icon={faUser} />Profile
				</a>
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={signout} class="flex items-center gap-2" variant="destructive">
				<Fa icon={faArrowRightFromBracket} /> Sign Out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
