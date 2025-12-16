<script lang="ts">
	import Fa from 'svelte-fa';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import FlexColContainer from '../generic/flexContainers/flexColContainer.svelte';

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
			.then(async (response) => {
				let responseJson = await response.json();
				if (!response.ok) {
					errorText = responseJson.msg;
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return responseJson;
			})
			.then((data) => {
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
		<FlexColContainer class="h-fit w-1/4 items-stretch justify-stretch">
			<nav class="relative flex w-full items-center justify-around">
				<button
					class="ignore cursor-pointer border-b-2 border-transparent transition-all hover:border-white"
					onclick={() => (signupVisible = true)}>Sign Up</button
				>
				<button
					class="ignore cursor-pointer border-b-2 border-transparent transition-all hover:border-white"
					onclick={() => (signupVisible = false)}>Login</button
				>
				<button onclick={onClose} class="ignore absolute right-2 cursor-pointer">
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
					class="w-full"
					placeholder="example@example.com"
				/>
				<br />
				<label for="Password">Password:</label>
				<input type="password" name="Password" id="password" class="w-full" placeholder="Abc123!" />
				{#if signupVisible}
					<label for="Password-repeat">Password (Repeat):</label>
					<input
						type="password"
						name="Password-repeat"
						id="password-repeat"
						placeholder="Abc123!"
						class="w-full"
					/>
					<p id="error-text" class="text-red-500">{errorText}</p>
					<button onclick={signup}>Sign Up</button>
				{:else}
					<p id="error-text" class="text-red-500">{errorText}</p>
					<button onclick={login}>Login</button>
				{/if}
			</div>
		</FlexColContainer>
	</div>
{/if}
