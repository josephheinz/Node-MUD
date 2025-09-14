<script lang="ts">
	import { page } from '$app/stores';

	type Profile = {
		id: string;
		username: string;
		joined_at: Date;
	};

	let profile: Profile | undefined = $page.data.profile;
</script>

{#if profile}
	<p>{profile.username}</p>
	<p>Joined: {profile.joined_at}</p>
{:else}
	<p>profile doesnt exist</p>
{/if}
