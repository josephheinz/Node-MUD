<script lang="ts">
	import { gameState } from '$lib/store.svelte';
	import * as Card from '../card';
	import * as Pagination from '../pagination/index';
	import type { Inventory } from '$lib/types/item';
	import type { Item } from '$lib/types/item';
	import ItemRenderer from '../itemRenderer.svelte';

	const {
		inventory: initInventory,
		display = false
	}: { display?: boolean; inventory?: Inventory } = $props();

	let inventory: Inventory = $state(initInventory ?? gameState.inventory);
	let pageNumber: number = $state(1);
	let page: Item[] = $derived.by(() => inventory.paginate()[pageNumber - 1]);

	$effect(() => {
		if (initInventory) return;
		inventory = gameState.inventory;
	});
</script>

<Card.Root class="aspect-square p-2 select-none">
	<Card.Header>
		<Card.Title>{!display ? 'Your ' : ''}Inventory</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="grid size-full grid-cols-5 grid-rows-5 gap-2">
			{#each page as item (item.uid)}
				<ItemRenderer {item} equipFlags={{ equippable: !display }} />
			{/each}
		</div>
	</Card.Content>
	<Card.Footer>
		<Pagination.Root count={inventory.contents.length} perPage={25} bind:page={pageNumber}>
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
	</Card.Footer>
</Card.Root>
