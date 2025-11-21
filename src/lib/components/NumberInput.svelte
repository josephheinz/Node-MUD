<script lang="ts">
	// bindable props must come from $props()
	let {
		value: initialValue = $bindable(),
		min = undefined,
		max = undefined,
		step = 1
	}: { value: number; min: number | undefined; max: number | undefined; step: number } = $props();

	let value: number = $state(initialValue);
</script>

<div
	class="mx-2 inline-flex h-8 w-24 overflow-hidden rounded-sm border-2 border-zinc-600 bg-zinc-700"
>
	<button
		class="flex h-full w-6 items-center justify-center px-1 font-bold select-none"
		onclick={() => (value = Math.max(min ?? -Infinity, Number(value) - step))}
	>
		-
	</button>

	<input
		type="number"
		class="
      shrink
      [appearance:textfield]
      border-none
      bg-zinc-700
      p-1 text-right outline-none
      focus:ring-0
      focus:outline-none
      [&::-webkit-inner-spin-button]:appearance-none
      [&::-webkit-outer-spin-button]:appearance-none
    "
		bind:value
		{min}
		{max}
		{step}
	/>

	<button
		class="flex inline h-full items-center justify-center px-1 font-bold select-none"
		onclick={() => (value = Math.min(max ?? Infinity, Number(value) + step))}
	>
		+
	</button>
</div>
