<script lang="ts">
	import type { Profile } from '$lib/store.svelte';
	import { Equipment as TEquipment, Inventory as TInventory } from '$lib/types/item';
	import Spinner from '../spinner/spinner.svelte';
	import DisplayInventory from '../character/displayInventory.svelte';
	import DisplayEquipment from '../character/displayEquipment.svelte';
	import type { Skill, SkillKey } from '$lib/types/skills';
	import DisplaySkillMenu from '../skills/displaySkillMenu.svelte';
	import Button from '../button/button.svelte';
	import { Cog, Settings } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import ApiDialog from './apiDialog.svelte';
	import type { IApiSettings } from '$lib/remote/profile.remote';

	const {
		data
	}: {
		data: {
			profile: Profile | undefined;
			apiSettings: IApiSettings | undefined;
			equipment: TEquipment | undefined;
			inventory: TInventory | undefined;
			isUser: boolean;
			skills: Record<SkillKey, Skill> | undefined;
		};
	} = $props();

	let inventory = $derived(data.inventory);
	let user = $derived(data.isUser);
	let equipment = $derived(data.equipment);
	let api_settings = $derived(data.apiSettings);
	let profile = $derived(data.profile);
	let skills = $derived(data.skills);

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<svelte:boundary>
		{#snippet pending()}
			<div class="flex flex-col items-center justify-center gap-4">
				<h1 class="text-4xl font-black">Loading...</h1>
				<Spinner class="size-8" />
			</div>
		{/snippet}
		<div class="group relative flex items-center justify-start gap-4 p-4">
			{#if profile && api_settings}
				{#if user}
					<Button
						variant="ghost"
						class="absolute top-5 right-5 cursor-pointer opacity-0 transition duration-150 group-hover:opacity-100"
						onclick={() => (open = true)}><Settings /></Button
					>
					{#if inventory}
						<DisplayInventory {inventory} display={true} />
					{/if}
					{#if equipment}
						<DisplayEquipment {equipment} display={true} />
					{/if}
					{#if skills}
						<DisplaySkillMenu {skills} />
					{:else}
						<span>skills undefined</span>
					{/if}
				{:else}
					{#if api_settings.inventory_api && inventory}
						<DisplayInventory {inventory} display={true} />
					{/if}
					{#if api_settings.equipment_api && equipment}
						<DisplayEquipment {equipment} display={true} />
					{/if}
					{#if skills}
						<DisplaySkillMenu {skills} />
					{/if}
				{/if}
			{/if}
		</div>
	</svelte:boundary>
	<ApiDialog settings={api_settings!} />
</Dialog.Root>
