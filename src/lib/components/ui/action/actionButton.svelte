<script lang="ts">
	import type { Action } from '$lib/types/action';

	const { action, disabled = false }: { action: Action; disabled?: boolean } = $props();
</script>

<div
	class={`flex aspect-square cursor-pointer flex-col items-center justify-between gap-4 rounded-lg border-2 border-border bg-secondary p-4 text-secondary-foreground ${disabled ? 'cursor-not-allowed bg-muted text-muted-foreground opacity-35' : ''}`}
>
	<img src={action.icon} alt="Action icon" class="w-[65%] shrink" />
	<div class="grow">
		<b>{action.name}</b>
	</div>
</div>
