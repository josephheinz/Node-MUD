// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { initSocketServer } from '$lib/server/socket';

// @ts-expect-error - server is available in dev mode
const server = globalThis.__sveltekit_server__;

if (server) {
  initSocketServer(server);
}

export const handle: Handle = async ({ event, resolve }) => {
  // You can add custom logic here if needed
  return resolve(event);
};