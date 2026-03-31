<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '../input/input.svelte';
	import Label from '../label/label.svelte';
	import { type IApiSettings } from '$lib/remote/profile.remote';
	import { toast } from 'svelte-sonner';
	import Switch from '../switch/switch.svelte';
	import { updateApiSettings } from '$lib/remote/profile.remote';

	let { settings }: { settings: IApiSettings } = $props();
</script>

<Dialog.Content>
	<Dialog.Header>
		<Dialog.Title>API Settings</Dialog.Title>
	</Dialog.Header>
	<form
		class="flex flex-col items-end justify-evenly gap-4"
		{...updateApiSettings.enhance(async ({ form, data, submit }) => {
			try {
				await submit();
				toast.success('Successfully updated your API settings');
				window.location.reload();
			} catch (err) {
				toast.error('There was an error');
			}
		})}
	>
		<section class="flex w-full items-start justify-start gap-2">
			<input
				{...updateApiSettings.fields.inventory_api.as('checkbox')}
				type="checkbox"
				bind:checked={settings.inventory_api}
			/>
			<Label for="inventory_api">Inventory API</Label>
		</section>
		<section class="flex w-full items-start justify-start gap-2">
			<input
				{...updateApiSettings.fields.equipment_api.as('checkbox')}
				type="checkbox"
				bind:checked={settings.equipment_api}
			/>
			<Label for="equipment_api">Equipment API</Label>
		</section>
		<section class="flex w-full items-start justify-start gap-2">
			<input
				{...updateApiSettings.fields.skills_api.as('checkbox')}
				type="checkbox"
				bind:checked={settings.skills_api}
			/>
			<Label for="skills_api">Skills API</Label>
		</section>
		<Input type="submit" value="Save Changes" />
	</form>
</Dialog.Content>
