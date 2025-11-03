<script lang="ts">
	let { value = 0, max = 100 }: { value: number; max: number } = $props();
	let percentText = $derived(`${((value / max) * 100).toString().split(".")[0]}%`);
	let innerWidth = $derived((value / max) * 100);
</script>

<div class="w-full rounded-full border-2 border-zinc-600 bg-zinc-700 p-1">
	<div
		class="flex h-4 items-center justify-center rounded-full bg-indigo-500 transition-all duration-100 ease-in-out"
		style="width:min({innerWidth}%,{max}%);"
	>
		<span class="text-xs text-zinc-300 select-none">{percentText}</span>
	</div>
</div>
