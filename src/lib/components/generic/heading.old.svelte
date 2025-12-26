<script lang="ts">
	const { children, class: userClass = '', ...restProps } = $props();
</script>

<h1 class={`text-2xl font-bold ${userClass ?? ''}`} {...restProps}>
	{@render children?.()}
</h1>
