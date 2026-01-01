<script lang="ts">
	import Button from '../button/button.svelte';
	import * as Card from '../card';
	import Progress from '../progress/progress.svelte';
</script>

<Card.Root class="select-none">
	<Card.Header class="w-full cursor-pointer" onclick={() => {}}>
		<Card.Title>Action Queue</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col items-start justify-start gap-2">
		<Progress value={Math.floor(Math.random() * 100)} />
		<span class="text-sm text-card-foreground">Current action: [action name]</span>
	</Card.Content>
	<Card.Footer class="flex flex-col items-start justify-start text-xs text-muted-foreground">
		<span>Upcoming actions: </span>
		<span
			>[action name] x1000
			<Button variant="outline" size="icon-xs">&bullet;&bullet;&bullet;</Button></span
		>
	</Card.Footer>
</Card.Root>
