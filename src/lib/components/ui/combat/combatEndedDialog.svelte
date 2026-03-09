<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { StackableModifier } from '$lib/modifiers/basicModifiers';
	import type { ICombatEndState } from '$lib/types/combat';
	import ItemHover from '../chat/itemHover.svelte';

	const { ended }: { ended: ICombatEndState | null } = $props();
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title class="text-3xl font-black">Combat Ended!</Dialog.Title>
	</Dialog.Header>
	<section>
		<h2 class="text-lg font-semibold">Drops:</h2>
		<div class="flex w-3/5 flex-col pl-4">
			{#each ended?.drops as item}
				{@const stack: StackableModifier | null = item.modifiers.find(m => m.type === "Stackable") as StackableModifier}
				<div class="flex items-center justify-start gap-2">
					<span>{stack?.amount ?? 1}x</span>
					<ItemHover {item} />
				</div>
			{/each}
		</div>
	</section>
	<section>
		<h2 class="text-lg font-semibold">XP:</h2>
		<div class="flex w-3/5 flex-col pl-4">
			{#if ended?.xp}
				{#each Object.entries(ended?.xp) as [skill, amount]}
					{#if amount > 0}
						<div>{skill}: {amount}</div>
					{/if}
				{/each}
			{/if}
		</div>
	</section>
</Dialog.Content>
