<script lang="ts">
	let { user } = $props();

    let opened = $state(false);
</script>

{#if opened}
<p>opened</p>
{:else}
<p>closed</p>
{/if}