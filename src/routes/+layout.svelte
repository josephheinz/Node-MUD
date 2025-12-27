<script lang="ts">
	import '../app.css';
	import '../ui.css';
	import { ModeWatcher } from 'mode-watcher';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/images/items/weapons/swords/ironSword.svg" />
</svelte:head>

<ModeWatcher />
<div class="size-full bg-background text-foreground">
	{@render children?.()}
</div>
