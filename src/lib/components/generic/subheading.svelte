<script lang="ts">
	const { children, class: userClass = '', ...restProps } = $props();
</script>

<h1 class={`text-xl font-semibold ${userClass ?? ''}`} {...restProps}>
	{@render children?.()}
</h1>
