<script lang="ts">
	let { value = false }: { value: boolean } = $props();

	function handleToggle() {
		value = !value;
		dispatchEvent(new CustomEvent('toggle', { detail: value }));
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={value}
	aria-label="Toggle"
	onclick={handleToggle}
	class={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
		${value ? 'bg-green-500' : 'bg-gray-300'}`}
>
	<span
		class={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
			${value ? 'translate-x-6' : 'translate-x-1'}`}
	>
	</span>
</button>
