import { getProfilePage } from '$lib/remote/profile.remote.js';

export interface IApiSettings {
	profile_id: string;
	inventory_api: boolean;
	equipment_api: boolean;
}

export const prerender = true;

export async function load({ params }) {
	const { username } = params;

	return await getProfilePage(username);
}
