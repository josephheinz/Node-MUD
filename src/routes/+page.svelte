<script lang="ts">
	import LoginModal from '$lib/components/auth/loginModal.svelte';
	import LoginButton from '$lib/components/auth/loginButton.svelte';
	import ProfileDropdown from '$lib/components/auth/profileDropdown.svelte';
	import { type Equipment } from '$lib/types/equipment';
	import { get } from 'svelte/store';
	import * as store from '$lib/store';
	import { type Item } from '$lib/types/item';
	import CharacterMenu from '$lib/components/character/characterMenu.svelte';
	import { getModifiedStats, type StatList } from '$lib/types/stats';
	import Reforger from '$lib/components/reforger.svelte';
	import Chat from '$lib/components/chat/chat.svelte';
	import { type User } from '@supabase/supabase-js';
	import { actionCategories, type DBQueueAction } from '$lib/types/action';
	import Queue from '$lib/components/actions/queue.svelte';
	import ActionSelect from '$lib/components/actions/actionSelect.svelte';
	import ActionModal from '$lib/components/actions/actionModal.svelte';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import SkillMenu from '$lib/components/skills/skillMenu.svelte';
	import QueueModal from '$lib/components/actions/queueModal.svelte';

	let loginModalOpen = $state(false);
	let queueModalOpen = $state(false);

	let user = $state<User>(get(store.user));
	let inventory = $state<Item[]>(get(store.inventory));
	let equipment = $state<Equipment>(get(store.equipment));
	let stats = $state<StatList>(get(store.modifiedStats)); // not base because base only gets updated when character upgrades are made
	let skills = $state<Record<SkillKey, Skill>>(get(store.skills));
	let queue = $state<DBQueueAction[]>(get(store.actionQueue));
	let queueActive = $state<boolean>(get(store.queueActive));
	let profile = $state<store.Profile>(get(store.profile));

	let tabs: string[] = ['Character', 'Reforge', 'Actions', 'Skills'];
	let currentTab: string = $state(tabs[0]);

	store.inventory.subscribe((value) => {
		inventory = value;
		store.modifiedStats.set(getModifiedStats(get(store.baseStats), get(store.equipment)));
	});

	store.equipment.subscribe((value) => {
		equipment = value;
		store.modifiedStats.set(getModifiedStats(get(store.baseStats), equipment));
	});

	store.user.subscribe((value) => (user = value));
	store.modifiedStats.subscribe((value) => (stats = value));
	store.actionQueue.subscribe((value) => (queue = value));
	store.queueActive.subscribe((value) => (queueActive = value));
	store.profile.subscribe((value) => (profile = value));
	store.skills.subscribe((value) => (skills = value));
</script>

<title>Web-based Runescape-like Alpha</title>
<!--Subject to change-->

<div class="z-0 flex h-full items-start justify-start">
	{#if profile}
		<div class="relative flex h-full w-full flex-col items-start justify-start">
			<nav class="flex h-min w-full items-center justify-evenly border-b-2 border-zinc-600 p-2">
				<Queue {queue} running={queueActive} bind:queueModalOpen />
				<div class="flex grow items-start justify-end">
					<ProfileDropdown {profile} />
				</div>
			</nav>
			<main class="flex w-full grow items-start justify-start">
				<aside class="flex h-full shrink flex-col border-r-4 border-zinc-600">
					{#each tabs as tab}
						<button
							class="text-md cursor-pointer p-6 font-semibold hover:bg-zinc-500"
							onclick={() => (currentTab = tab)}
						>
							{tab}
						</button>
					{/each}
				</aside>
				<div class="h-full w-full grow">
					{#if currentTab === 'Character'}
						{#if inventory && equipment}
							<CharacterMenu {inventory} {equipment} {stats} />
						{/if}
					{:else if currentTab === 'Reforge'}
						<Reforger item={undefined} {equipment} {inventory} />
					{:else if currentTab === 'Actions'}
						<ActionSelect categories={Object.keys(actionCategories)} />
					{:else if currentTab === 'Skills'}
						<SkillMenu bind:skills />
					{/if}
				</div>
			</main>
			{#if user}
				<ActionModal />
				<Chat {user} />
				<QueueModal
					bind:queue
					bind:open={queueModalOpen}
					onClose={() => (queueModalOpen = false)}
				/>
			{/if}
		</div>
	{:else}
		<div class="flex size-full items-center justify-center">
			<LoginButton onclick={() => (loginModalOpen = true)} />
			<LoginModal bind:open={loginModalOpen} onClose={() => (loginModalOpen = false)} />
		</div>
	{/if}
</div>
