<script lang="ts">
	import { gameState } from '$lib/store.svelte';
	import * as Card from '../card';
	import * as Pagination from '../pagination/index';
	import type { Inventory } from '$lib/types/item';
	import type { Item } from '$lib/types/item';
	import ItemRenderer from '../itemRenderer.svelte';
	import { getInventory } from '$lib/remote/inventory.remote';
	import Skeleton from '../skeleton/skeleton.svelte';

	const {
		inventory: initInventory,
		display = false
	}: { display?: boolean; inventory?: Inventory } = $props();

	let inventory: Inventory = $state(initInventory ?? gameState.inventory);
	let pageNumber: number = $state(1);
	let page: Item[] = $derived.by(() => inventory.paginate()[pageNumber - 1]);
</script>

<Card.Root class="aspect-square p-2 select-none">
	<Card.Header>
		<Card.Title>{!display ? 'Your ' : ''}Inventory</Card.Title>
	</Card.Header>
	<Card.Content>
		<svelte:boundary>
			{#snippet pending()}
				<div class="grid size-full grid-cols-5 grid-rows-5 gap-2">
					{#each { length: 25 }}
						<Skeleton class="size-16 rounded-md" />
					{/each}
				</div>
			{/snippet}
			<div class="grid size-full grid-cols-5 grid-rows-5 gap-2">
				{#each (await getInventory())?.paginate()[pageNumber - 1] as item (item.uid)}
					<ItemRenderer {item} equipFlags={{ equippable: !display }} />
				{/each}
				<!-- {#each page as item (item.uid)}
					<ItemRenderer {item} equipFlags={{ equippable: !display }} />
				{/each} -->
			</div>
		</svelte:boundary>
	</Card.Content>
	<Card.Footer>
		<svelte:boundary>
			{#snippet pending()}
				<Skeleton class="w-full rounded-full" />
			{/snippet}
			<Pagination.Root
				count={(await getInventory()).contents.length}
				perPage={25}
				bind:page={pageNumber}
			>
				{#snippet children({ pages, currentPage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.Previous />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={currentPage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.Next />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</svelte:boundary>
	</Card.Footer>
</Card.Root>
