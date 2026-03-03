<script lang="ts">
	import * as Sidebar from './sidebar';
	import NavProfile from './auth/navProfile.svelte';
	import { sidebar, tab } from '$lib/store.svelte';
	import ProfileAvatar from './auth/profileAvatar.svelte';
	import OnlineCounter from './onlineCounter.svelte';
	import QueueDisplay from './action/queueDisplay.svelte';
	import {
		Anvil,
		Backpack,
		Boxes,
		ChartNoAxesColumn,
		Clipboard,
		House,
		Swords,
		type Icon
	} from '@lucide/svelte';

	const items: Array<{ tab: typeof tab.tab; icon: typeof Icon; href?: string }> = [
		{
			tab: 'Home',
			icon: House,
			href: '/home'
		},
		{
			tab: 'Inventory',
			icon: Boxes
		},
		{
			tab: 'Equipment',
			icon: Backpack
		},
		{
			tab: 'Actions',
			icon: Clipboard
		},
		{
			tab: 'Skills',
			icon: ChartNoAxesColumn
		},
		{
			tab: 'Forge',
			icon: Anvil
		},
		{
			tab: 'Combat',
			icon: Swords
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
									{@const Icon = item.icon}
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
										<Icon size="18" />
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
