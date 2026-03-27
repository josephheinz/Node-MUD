<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '../input/input.svelte';
	import Label from '../label/label.svelte';
	import Separator from '../separator/separator.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { updateProfileSettings, type IApiSettings } from '$lib/remote/profile.remote';
	import type { SvelteComponent } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Switch from '../switch/switch.svelte';

	let { settings }: { settings: IApiSettings } = $props();
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title>API Settings</Dialog.Title>
	</Dialog.Header>
	<form class="flex flex-col items-end justify-evenly gap-4">
		{#each Object.entries(settings) as [name, value]}
			{#if typeof value === 'boolean'}
				<section class="flex w-full flex-col items-start justify-start">
					<span>
						{name
							.replace(/_([a-z])/g, (_, c) => ' ' + c.toUpperCase())
							.replace(/^([a-z])/, (c) => c.toUpperCase())}
					</span>
					<span>
						{value}
						<Switch />
					</span>
				</section>
			{/if}
		{/each}
	</form>
</Dialog.Content>
