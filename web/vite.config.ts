import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// backend.py (Flask) serves the API and, in production, this app's build folder.
const BACKEND = 'http://127.0.0.1:3000';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Single-page app: every page is one HTML shell (200.html) that backend.py serves.
			adapter: adapter({ fallback: '200.html' })
		})
	],
	server: {
		// `npm run dev`: send backend routes to Flask. The Host header is kept, so add
		// http://localhost:5173/auth/callback (Discord) and /verify/callback (Roblox) as redirect URLs.
		proxy: {
			'/api': BACKEND,
			'/auth': BACKEND,
			'^/verify/(start|callback)': BACKEND
		}
	}
});
