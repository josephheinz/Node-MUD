<script lang="ts">
	import Enhancer from './enhancer.svelte';
	import Reforger from './reforger.svelte';
</script>

<div class="grid size-full grid-cols-4 grid-rows-4 gap-2">
	<svelte:boundary>
		{#snippet failed(error, reset)}
			<button onclick={reset}>oops! try again</button>
		{/snippet}
		<Reforger />
		<Enhancer />
	</svelte:boundary>
</div>
