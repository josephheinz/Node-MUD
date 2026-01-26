<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronsUpDown } from '@lucide/svelte';
	import { buttonVariants } from '../button';
	import Button from '../button/button.svelte';
</script>

<Collapsible.Root class="w-max p-0">
	<Card.Root class="w-max p-2 px-0">
		<div class="flex items-center justify-between space-x-4 px-4">
			<span class="text-xl font-semibold">Enhancer</span>
			<Collapsible.Trigger class={buttonVariants({ variant: 'ghost', class: 'w-9 p-0' })}>
				<ChevronsUpDown size="24" />
			</Collapsible.Trigger>
		</div>
		<Collapsible.Content>
			<Card.Content>
				<div class="flex flex-col items-center justify-center gap-4">
					<button>choose item</button>
					<Button>Enhance</Button>
				</div>
			</Card.Content>
		</Collapsible.Content>
	</Card.Root>
</Collapsible.Root>
