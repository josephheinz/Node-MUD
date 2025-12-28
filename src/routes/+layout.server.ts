// +layout.server.ts
import { initializeItemRegistry } from '$lib/types/item';

export async function load() {
	initializeItemRegistry();
	return {};
}
