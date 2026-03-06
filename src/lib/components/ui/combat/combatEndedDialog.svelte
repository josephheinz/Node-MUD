<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import type { ICombatEndState } from '$lib/types/combat';

	const { ended }: { ended: ICombatEndState | null } = $props();
</script>

<Dialog.Content>
	<Dialog.Header>
		<h1 class="text-3xl font-black">Combat Ended!</h1>
	</Dialog.Header>
</Dialog.Content>
