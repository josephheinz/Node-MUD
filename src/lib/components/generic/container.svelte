<script lang="ts">
	const { class: userClass = '', children, ...restProps } = $props();
</script>

<div
	class={`m-2 inline rounded-md border-2 border-zinc-700 bg-zinc-800 p-2 ${userClass}`}
	{...restProps}
>
	{@render children?.()}
</div>
