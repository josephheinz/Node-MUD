<script lang="ts">
	import {
		faBoxesStacked,
		faClipboardList,
		faHome,
		faToolbox,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import * as Sidebar from './sidebar';
	import Fa from 'svelte-fa';
	import NavProfile from './auth/navProfile.svelte';
	import { sidebar, tab } from '$lib/store.svelte';
	import ProfileAvatar from './auth/profileAvatar.svelte';
	import OnlineCounter from './onlineCounter.svelte';
	import QueueDisplay from './action/queueDisplay.svelte';

	const items: Array<{ tab: typeof tab.tab; icon: IconDefinition; href?: string }> = [
		{
			tab: 'Home',
			icon: faHome,
			href: '/home'
		},
		{
			tab: 'Inventory',
			icon: faBoxesStacked
		},
		{
			tab: 'Equipment',
			icon: faToolbox
		},
		{
			tab: 'Actions',
			icon: faClipboardList
		}
	];

	let open: boolean = $derived(sidebar.open);
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		{#if open}
			<h1 class="text-2xl font-bold">Web based Runescape-like</h1>
		{/if}
		<OnlineCounter short={!open} />
	</Sidebar.Header>
	<Sidebar.Content class="flex flex-col items-start justify-between">
		<Sidebar.Group>
			<Sidebar.GroupLabel>Game</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.tab)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<button
										onclick={() => {
											if (item.href) {
												if (window.location.href.split(window.location.host)[1] !== item.href)
													window.location.href = item.href;
												else tab.tab = item.tab;
											} else {
												tab.tab = item.tab;
											}
										}}
										{...props}
									>
										<Fa icon={item.icon} />
										<span>{item.tab}</span>
									</button>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		{#if open}
			<Sidebar.Group>
				<QueueDisplay />
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>
	{#if open}
		<Sidebar.Footer>
			<NavProfile />
		</Sidebar.Footer>
	{:else}
		<ProfileAvatar />
	{/if}
</Sidebar.Root>
