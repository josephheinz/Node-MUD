<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	const {
		onclick,
		class: userClass = '',
		children,
		...restProps
	}: {
		onclick: MouseEventHandler<HTMLButtonElement> | null | undefined;
		class: string;
		children: any;
	} = $props();
</script>

<button
	class={`flex aspect-square h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-zinc-500 bg-zinc-600 text-sm select-none ${userClass}`}
	{...restProps}
	{onclick}
>
	{@render children?.()}
</button>
