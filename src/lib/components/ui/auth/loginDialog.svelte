<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Fa from 'svelte-fa';
	import { buttonVariants } from '../button';
	import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
	import Button from '../button/button.svelte';
	import Label from '../label/label.svelte';
	import Input from '../input/input.svelte';

	let tab = $state<'login' | 'signup'>('login');

	let emailVal: string = $state('');
	let passVal: string = $state('');
	let passRepVal: string = $state('');
	let errorText: string = $state('');
	let successText: string = $state('');

	async function login() {
		let loginData = {
			email: emailVal,
			password: passVal
		};

		fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(loginData)
		})
			.then(async (response) => {
				let responseJSON = await response.json();
				if (!response.ok) {
					errorText = responseJSON.msg;
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJSON;
			})
			.then((data) => {
				window.location.reload();
			})
			.catch((err) => {
				console.error(err);
			});
	}

	async function signup() {
		if (passVal !== passRepVal) {
			errorText = 'Passwords must match';
			return;
		}

		let loginData = {
			email: emailVal,
			password: passVal
		};

		fetch('/api/auth/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(loginData)
		})
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					errorText = responseJson.msg;
					throw new Error(JSON.stringify(response));
				}
				return responseJson;
			})
			.then((data) => {
				successText = 'Successfully signed up! A confirmation email has been sent to your inbox';
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function handleSubmit() {
		if (tab === 'login') login();
		else signup();
	}
</script>

<Dialog.Root>
	<form onsubmit={handleSubmit}></form>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}
		><Fa icon={faArrowRightToBracket} /> Login</Dialog.Trigger
	>
	<Dialog.Content>
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
	</Dialog.Content>
</Dialog.Root>

{#snippet loginContent()}
	<Dialog.Header>
		<Dialog.Title>Login</Dialog.Title>
	</Dialog.Header>
	<div class="grid gap-4">
		{@render emailFirstPass()}
	</div>
	{@render footer(tab)}
{/snippet}

{#snippet signupContent()}
	<Dialog.Header>
		<Dialog.Title>Sign Up</Dialog.Title>
	</Dialog.Header>
	<div class="grid gap-4">
		{@render emailFirstPass()}
		<div class="grid gap-3">
			<Label for="passwordrep">Password (Repeat)</Label>
			<Input
				id="passwordrep"
				name="passwordrep"
				type="password"
				placeholder="Securepass1!"
				bind:value={passRepVal}
			/>
		</div>
	</div>
	{@render footer(tab)}
{/snippet}

{#snippet emailFirstPass()}
	<div class="grid gap-3">
		<Label for="email">Email</Label>
		<Input
			id="email"
			placeholder="example@example.com"
			name="email"
			type="email"
			required={true}
			bind:value={emailVal}
		/>
	</div>
	<div class="grid gap-3">
		<Label for="password">Password</Label>
		<Input
			id="password"
			placeholder="Securepass1!"
			name="password"
			type="password"
			required={true}
			bind:value={passVal}
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
		<Button onclick={handleSubmit}>{_tab === 'login' ? 'Login' : 'Sign up'}</Button>
	</Dialog.Footer>
{/snippet}
