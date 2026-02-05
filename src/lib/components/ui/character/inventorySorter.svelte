<script lang="ts">
	import * as ButtonGroup from '../button-group';
	import * as DropdownMenu from '../dropdown-menu';
	import Button from '../button/button.svelte';
	import { ArrowDownAZ, ArrowUpAZ, BookA, Boxes, Clock, Icon, Sparkles } from '@lucide/svelte';

	let {
		algorithm = $bindable(),
		direction = $bindable()
	}: {
		algorithm: 'Chronological' | 'Rarity' | 'Stack Size' | 'Alphabetical';
		direction: 'asc' | 'desc';
	} = $props();

	const algos: { name: typeof algorithm; icon: typeof Icon }[] = [
		{ name: 'Chronological', icon: Clock },
		{ name: 'Rarity', icon: Sparkles },
		{ name: 'Stack Size', icon: Boxes },
		{ name: 'Alphabetical', icon: BookA }
	];

	let open = $state(false);

	function swapModes() {
		direction = direction === 'asc' ? 'desc' : 'asc';
	}

	function swapAlgo(newAlgo: typeof algorithm) {
		algorithm = newAlgo;
		open = false;
	}
</script>

<ButtonGroup.Root>
	<DropdownMenu.Root bind:open>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				{@const Icon = algos.find((a) => a.name === algorithm)?.icon}
				<Button
					{...props}
					variant="outline"
					class="flex items-center justify-start gap-2 text-xs"
					size="sm"><Icon /> {algorithm}</Button
				>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each algos as algo}
				{@const Icon = algo.icon}
				<DropdownMenu.Label
					class="flex cursor-pointer items-center justify-start gap-2 select-none"
					onclick={() => swapAlgo(algo.name)}><Icon size="14" /> {algo.name}</DropdownMenu.Label
				>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<Button variant="outline" size="sm" onclick={swapModes}>
		{#if direction === 'asc'}
			<ArrowUpAZ />
		{:else}
			<ArrowDownAZ />
		{/if}
	</Button>
</ButtonGroup.Root>
