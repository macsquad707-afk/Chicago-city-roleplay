<script lang="ts">
	import './verified.css';
	import { onMount } from 'svelte';
	import DiscordIcon from '#lib/DiscordIcon.svelte';

	interface Verified { roblox_username: string; roblox_id: string; discord_id: string; guild_url: string }
	let v = $state<Verified | null>(null);

	onMount(async () => {
		try {
			const r = await fetch('/api/verify/me', { credentials: 'include' });
			if (!r.ok) throw 0;
			v = await r.json();
		} catch {
			location.href = '/verify';
		}
	});
</script>

<svelte:head>
	<title>Verified</title>
	<meta name="theme-color" content="#0a1424" />
	<link rel="icon" href="/logo.webp" />
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<main class="card">
	<div class="check"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg></div>
	<div class="k">Verified</div>
	<h1>You're all set.</h1>
	<p class="msg">Your accounts are linked. Head back to Discord. Your <b>Verified</b> role is on its way.</p>
	<div class="user"><div class="k">Roblox username</div><h2>{v?.roblox_username ?? ''}</h2></div>
	<div class="ids"><div>Roblox ID <b>{v?.roblox_id ?? ''}</b></div><div>Discord ID <b>{v?.discord_id ?? ''}</b></div></div>
	<div class="left"><a class="btn" href={v?.guild_url ?? '#'}><DiscordIcon />Back to our Discord</a></div>
</main>
