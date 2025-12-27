import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
/* import { webSocketServer } from './src/lib/server/socketPlugin.js';
 */
export default defineConfig({
	plugins: [tailwindcss(), sveltekit() /* webSocketServer() */]
});
