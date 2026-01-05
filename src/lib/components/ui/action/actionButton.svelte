<script lang="ts">
	import type { Action } from '$lib/types/action';

	const { action }: { action: Action } = $props();
</script>

<div
	class="flex aspect-square cursor-pointer flex-col items-center justify-between gap-4 rounded-lg border-2 border-ring bg-secondary p-4 text-secondary-foreground"
>
	<img src={action.icon} alt="Action icon" class="w-[65%] shrink" />
	<div class="grow">
		<b>{action.name}</b>
	</div>
</div>
