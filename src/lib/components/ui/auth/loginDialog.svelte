<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Fa from 'svelte-fa';
	import { buttonVariants } from '../button';
	import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
	import Button from '../button/button.svelte';
	import Label from '../label/label.svelte';
	import Input from '../input/input.svelte';
	import { signup, login } from '$lib/remote/auth.remote';
	import { toast } from 'svelte-sonner';

	let tab = $state<'login' | 'signup'>('login');

	let errorText: string = $state('');
	let successText: string = $state('');
	let action = $derived(tab === 'login' ? login : signup);
</script>

<svelte:boundary>
	{#snippet pending()}
		<span>Loading</span>
	{/snippet}
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
			><Fa icon={faArrowRightToBracket} />Login</Dialog.Trigger
		>
		<Dialog.Content>
			<form
				{...action.enhance(async ({ submit }) => {
					try {
						await submit();
						location.href = '/home';
					} catch (e) {
						toast.error('Something went wrong logging in');
					}
				})}
			>
				{#if tab === 'login'}
					{@render loginContent()}
				{:else}
					{@render signupContent()}
				{/if}
				{#if errorText.trim() !== ''}
					<span class="text-rose-500">{errorText}</span>
				{/if}
				{#if successText.trim() !== ''}
					<span class="text-blue-500">{successText}</span>
				{/if}
			</form>
		</Dialog.Content>
	</Dialog.Root>
</svelte:boundary>

{#snippet loginContent()}
	<div class="flex flex-col gap-4">
		<Dialog.Header>
			<Dialog.Title>Login</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4">
			{@render emailFirstPass()}
		</div>
		{@render footer(tab)}
	</div>
{/snippet}

{#snippet signupContent()}
	<div class="flex flex-col gap-4">
		<Dialog.Header>
			<Dialog.Title>Sign Up</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4">
			{@render emailFirstPass()}
			<div class="grid gap-3">
				<Label for="passwordrep">Password (Repeat)</Label>
				<Input
					id="passwordrep"
					placeholder="Securepass1!"
					{...signup.fields.passwordRepeat.as('password')}
				/>
			</div>
		</div>
		{@render footer(tab)}
	</div>
{/snippet}

{#snippet emailFirstPass()}
	<div class="grid gap-3">
		<Label for="email">Email</Label>
		<Input
			id="email"
			placeholder="example@example.com"
			required={true}
			{...tab === 'login' ? login.fields.email.as('email') : signup.fields.email.as('email')}
		/>
	</div>
	<div class="grid gap-3">
		<Label for="password">Password</Label>
		<Input
			id="password"
			placeholder="Securepass1!"
			required={true}
			{...tab === 'login'
				? login.fields.password.as('password')
				: signup.fields.password.as('password')}
		/>
	</div>
{/snippet}

{#snippet footer(_tab: 'login' | 'signup')}
	<Dialog.Footer class="flex items-center justify-end gap-4">
		<span class="text-sm">
			{_tab === 'login' ? "Don't have an account yet" : 'Already have an account'}?
			<button
				class="cursor-pointer hover:underline"
				onclick={() => (tab = _tab === 'login' ? 'signup' : 'login')}
				>{_tab === 'login' ? 'Sign up' : 'Login'}</button
			>
		</span>
		<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
		<Button type="submit">{_tab === 'login' ? 'Login' : 'Sign up'}</Button>
	</Dialog.Footer>
{/snippet}
