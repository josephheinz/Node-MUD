<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronsUpDown } from '@lucide/svelte';
	import { buttonVariants } from '../button';
	import Button from '../button/button.svelte';
</script>

<Collapsible.Root class="w-full p-0">
	<Card.Root class="w-full p-2 px-0">
		<div class="flex items-center justify-between space-x-4 px-4">
			<span class="text-xl font-semibold">Reforge</span>
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', class: 'w-9 p-0' })}>
				<ChevronsUpDown size="24" />
			</Collapsible.Trigger>
		</div>
		<Collapsible.Content>
			<Card.Content>
				<div class="flex flex-col items-center justify-center gap-4">
					<button
						class="col-start-1 flex size-16 cursor-pointer items-center justify-center rounded-md border-2 border-border bg-border p-2 text-xs"
						>Pick Item</button
					>
					<span></span>
					<Button>Reforge</Button>
				</div>
			</Card.Content>
		</Collapsible.Content>
	</Card.Root>
</Collapsible.Root>
