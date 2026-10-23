<script lang="ts">
	import './login.css';
	import { page } from '$app/state';

	// backend.py sends people back here with ?error=<key> when sign-in fails.
	const ERRORS: Record<string, string> = {
		login: "Discord sign-in didn't finish. Sign in again.",
		noaccess: 'This Discord account has no staff role in the server. Ask an admin for one, then sign in again.'
	};
	const error = $derived(ERRORS[page.url.searchParams.get('error') ?? '']);
</script>

<svelte:head>
	<title>Sign in | Chicago Moderation</title>
	<meta name="theme-color" content="#121212" />
	<link rel="icon" type="image/webp" href="/logo.webp" />
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<main>
	<img class="logo" src="/logo.webp" alt="" width="64" height="64" />
	<h1>Chicago Moderation</h1>
	<p class="lede">For server staff. Sign in with the Discord account you use in the server.</p>
	{#if error}<div class="error" role="alert">{error}</div>{/if}
	<a class="discord" href="/auth/login">
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37A19.8 19.8 0 0015.39 2.8a13.8 13.8 0 00-.63 1.3 18.4 18.4 0 00-5.52 0 12.6 12.6 0 00-.64-1.3 19.7 19.7 0 00-4.93 1.53C.53 9.05-.32 13.6.1 18.1a19.9 19.9 0 006.04 3.05 14.6 14.6 0 001.29-2.1 12.9 12.9 0 01-2.03-.98l.5-.38a14.2 14.2 0 0012.2 0l.5.38c-.65.38-1.33.71-2.04.98.37.74.8 1.44 1.3 2.1a19.8 19.8 0 006.03-3.05c.5-5.2-.84-9.7-3.57-13.73zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.19 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/></svg>
		Sign in with Discord
	</a>
	<p class="note">The panel reads only your Discord name and avatar, then checks your staff role in the server. It can't post or message as you.</p>
</main>
