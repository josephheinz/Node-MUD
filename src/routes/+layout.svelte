<script lang="ts">
	import '../app.css';
	import '../ui.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';

	const { children }: { children: any } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/images/items/weapons/swords/ironSword.svg" />
</svelte:head>

<ModeWatcher />
<Toaster position="bottom-right" richColors />
<!-- <DarkModeButton />
 -->

<div class="m-0 size-full p-0">
	{@render children?.()}
</div>
