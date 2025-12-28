<script lang="ts">
	import DarkModeButton from '$lib/components/ui/darkModeButton.svelte';
	import ItemRenderer from '$lib/components/ui/itemRenderer.svelte';
	import { Rarity } from '$lib/types/item';
</script>

<ItemRenderer
	item={{
		uid: 'e',
		id: 'e',
		name: 'Test',
		rarity: Rarity.Rare,
		icon: '/images/items/purpleBook.png',
		modifiers: []
	}}
	equipFlags={{
		equippable: false
	}}
/>

<DarkModeButton />
