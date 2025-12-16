<script lang="ts">
	import Container from './generic/container.svelte';
	import Heading from './generic/heading.svelte';
</script>

<Container class="size-content flex-col items-center justify-start">
	<Heading class="text-center">Enhancer</Heading>
	<div class="m-2 grid grid-cols-3 grid-rows-2 gap-8 p-2">
		<button
			class="row-start-1 flex aspect-square h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 text-sm select-none"
		>
			<span>Select</span>
			<span>Item</span>
		</button>
		<button
			class="col-start-2 row-start-2 flex aspect-square h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 text-sm select-none"
		>
			<span>Output</span>
		</button>
		<button
			class="col-start-3 row-start-1 flex aspect-square h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 text-sm select-none"
		>
			<span>Select</span>
			<span>Enhancer</span>
		</button>
	</div>
	<button> Enhance </button>
</Container>
