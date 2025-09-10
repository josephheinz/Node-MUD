<script lang="ts">
	import { supabase } from '$lib/auth/supabaseClient';
	import Fa from 'svelte-fa';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import { error } from '@sveltejs/kit';

	let { open = $bindable(true), onClose } = $props();
	let signupVisible = $state(true);
	let errorText = $state('');

	async function login() {
		let email: string = (<HTMLInputElement>document.getElementById('email')).value;
		let password: string = (<HTMLInputElement>document.getElementById('password')).value;

		let loginData = {
			email,
			password
		};

		fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(loginData)
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				console.log('Success:', data);
				window.location.reload();
			})
			.catch((error) => {
				console.error(error);
			});
	}

	async function signup() {
		let email: string = (<HTMLInputElement>document.getElementById('email')).value;
		let password: string = (<HTMLInputElement>document.getElementById('password')).value;
		let passwordRepeat: string = (<HTMLInputElement>document.getElementById('password-repeat'))
			.value;

		if (password !== passwordRepeat) {
			errorText = 'Passwords must match';
			return;
		}

		let loginData = {
			email,
			password
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
				console.log('Success:', data);
				window.location.reload();
			})
			.catch((error) => {
				console.error(error);
			});
	}
</script>

{#if open == true}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="absolute top-0 left-0 flex h-full w-full items-center justify-center backdrop-blur-xs"
	>
		<div
			class="h-fit w-1/4 flex-col items-stretch justify-stretch rounded-md border-4 border-white p-2 text-white"
		>
			<nav class="relative flex w-full items-center justify-around">
				<button
					class="cursor-pointer border-b-2 border-black transition-all hover:border-white"
					onclick={() => (signupVisible = true)}>Sign Up</button
				>
				<button
					class="cursor-pointer border-b-2 border-black transition-all hover:border-white"
					onclick={() => (signupVisible = false)}>Login</button
				>
				<button onclick={onClose} class="absolute right-2 cursor-pointer">
					<Fa icon={faXmark} />
				</button>
			</nav>
			<br />
			<div class="relative grow flex-col">
				<label for="Email">Email:</label>
				<input
					type="email"
					name="Email"
					id="email"
					class="h-8 w-full rounded-sm border-2 border-white bg-black p-1 text-white outline-none"
					placeholder="example@example.com"
				/>
				<br />
				<label for="Password">Password:</label>
				<input
					type="password"
					name="Password"
					id="password"
					class="h-8 w-full rounded-sm border-2 border-white bg-black p-1 text-white outline-none"
					placeholder="Abc123!"
				/>
				{#if signupVisible}
					<br />
					<label for="Password-repeat">Password (Repeat):</label>
					<input
						type="password"
						name="Password-repeat"
						id="password-repeat"
						class="h-8 w-full rounded-sm border-2 border-white bg-black p-1 text-white outline-none"
						placeholder="Abc123!"
					/>
					<p id="error-text" class="text-red-500">{errorText}</p>
					<button
						onclick={signup}
						class="my-2 cursor-pointer rounded-md border-4 border-white px-4 py-2 text-white"
						>Sign Up</button
					>
				{:else}
					<p id="error-text" class="text-red-500">{errorText}</p>
					<button
						onclick={login}
						class="my-2 cursor-pointer rounded-md border-4 border-white px-4 py-2 text-white"
						>Login</button
					>
				{/if}
			</div>
		</div>
	</div>
{/if}
