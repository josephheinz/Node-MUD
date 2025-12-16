<script lang="ts">
	import FlexColContainer from './generic/flexContainers/flexColContainer.svelte';
	import Heading from './generic/heading.svelte';
	import SquareTextButton from './generic/squareTextButton.svelte';
</script>

<FlexColContainer class="inline-flex items-center justify-start">
	<Heading class="text-center">Enhancer</Heading>
	<div class="m-2 grid grid-cols-3 grid-rows-2 gap-8 p-2">
		<SquareTextButton class="row-start-1" onclick={() => {}}>
			<span>Select</span>
			<span>Item</span>
		</SquareTextButton>
		<SquareTextButton class="col-start-2 row-start-2" onclick={() => {}}>
			<span>Output</span>
		</SquareTextButton>
		<SquareTextButton class="col-start-3 row-start-1" onclick={() => {}}>
			<span>Select</span>
			<span>Enhancer</span>
		</SquareTextButton>
	</div>
	<button> Enhance </button>
</FlexColContainer>
