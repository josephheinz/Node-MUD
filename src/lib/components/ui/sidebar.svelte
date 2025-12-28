<script lang="ts">
	import {
		faBoxesStacked,
		faHome,
		faToolbox,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import * as Sidebar from './sidebar';
	import Fa from 'svelte-fa';
	import NavProfile from './auth/navProfile.svelte';
	import { sidebar, tab } from '$lib/store.svelte';
	import ProfileAvatar from './auth/profileAvatar.svelte';

	const items: Array<{ tab: typeof tab.tab; icon: IconDefinition }> = [
		{
			tab: 'Home',
			icon: faHome
		},
		{
			tab: 'Inventory',
			icon: faBoxesStacked
		},
		{
			tab: 'Equipment',
			icon: faToolbox
		}
	];

	let open: boolean = $derived(sidebar.open);

	$inspect(tab.tab);
</script>

<Sidebar.Root collapsible="icon">
	{#if open}
		<Sidebar.Header>
			<h1 class="text-2xl font-bold">Web based Runescape-like</h1>
		</Sidebar.Header>
	{/if}
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Sidebar</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.tab)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<button onclick={() => (tab.tab = item.tab)} {...props}>
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
	</Sidebar.Content>
	{#if open}
		<Sidebar.Footer>
			<NavProfile />
		</Sidebar.Footer>
	{:else}
		<ProfileAvatar />
	{/if}
</Sidebar.Root>
