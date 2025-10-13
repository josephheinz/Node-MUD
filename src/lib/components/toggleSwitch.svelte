<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// prop
	export let value: boolean;

	// dispatcher with typed event
	const dispatch = createEventDispatcher<{ toggle: boolean }>();

	function handleToggle() {
		value = !value;
		dispatch('toggle', value);
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={value}
	on:click={handleToggle}
	class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
		${value ? 'bg-green-500' : 'bg-gray-300'}`}>
	<span
		class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
			${value ? 'translate-x-6' : 'translate-x-1'}`}>
	</span>
</button>
