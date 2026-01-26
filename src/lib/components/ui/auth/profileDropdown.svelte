<script lang="ts">
	import * as DropdownMenu from '../dropdown-menu';
	import { Button } from '../button/index';
	import UserAvatar from '../userAvatar.svelte';
	import { toggleMode, mode } from 'mode-watcher';
	import { capitalizeFirstLetter } from '$lib/utils/general';
	import { getProfile, logout } from '$lib/remote/auth.remote';
	import { toast } from 'svelte-sonner';
	import Skeleton from '../skeleton/skeleton.svelte';
	import { ChevronsUpDown, LogOut, Moon, Sun, User } from '@lucide/svelte';
</script>

<svelte:boundary>
	{#snippet pending()}
		<div class="flex h-10 w-full justify-start gap-4 px-4">
			<Skeleton class="aspect-square h-full rounded-full" />
			<Skeleton class="h-4/5 grow rounded-full" />
		</div>
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
				<ChevronsUpDown />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Label>Your Account</DropdownMenu.Label>
			<DropdownMenu.Group>
				<DropdownMenu.Item>
					<a href={`/profile/${profile.username}`} class="flex items-center gap-2">
						<User />Profile
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={toggleMode}>
					{#if mode.current === 'dark'}
						<Moon />
					{:else}
						<Sun />
					{/if}
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
							<LogOut /> Sign Out
						</DropdownMenu.Item>
					</button>
				</form>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</svelte:boundary>
