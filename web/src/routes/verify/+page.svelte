<script lang="ts">
	import './verify.css';
	import { page } from '$app/state';
	import { SITE_NAME, SITE_LOGO, DISCORD_INVITE, hasInvite } from '#lib/site.ts';

	const ROBLOX_START_URL = '/verify/start'; // backend route that signs them in with Discord, then Roblox

	// backend.py sends people back here with ?error=<key>
	const ERRORS: Record<string, string> = {
		setup: "Verification isn't set up yet. Let an admin know.",
		signin: 'Sign in with Discord first, then try again.',
		denied: "You cancelled the Roblox sign-in. Try again when you're ready.",
		notinserver: 'Join our Discord server first, then come back and verify.',
		taken: 'That Roblox account is already linked to a different Discord account. Ask staff for help.',
		db: "We couldn't save your verification. Try again in a minute.",
		failed: "Roblox sign-in didn't finish. Try again."
	};
	const err = $derived(page.url.searchParams.get('error'));
</script>

<svelte:head>
	<title>{SITE_NAME} | Verification</title>
	<meta name="theme-color" content="#03050b" />
	<link rel="icon" href={SITE_LOGO} />
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="top"><img alt="" src={SITE_LOGO} width="34" height="34" /><span>{SITE_NAME}</span></div>
<main class="wrap">
	<div class="tag"><b>{SITE_NAME}</b><span>Account verification</span></div>
	<h1>Sign in with Roblox to get <i>verified.</i></h1>
	<p class="lead">Roblox asks to share your username and avatar with {SITE_NAME}. Nothing else.</p>
	{#if err}<div class="alert" role="alert">{ERRORS[err] || ERRORS.failed}</div>{/if}
	<div class="card">
		<div class="chead"><img alt="" src={SITE_LOGO} width="44" height="44" /><div><b>{SITE_NAME} verification</b><span>{SITE_NAME}</span></div></div>
		<div class="body">
			<a class="go" href={ROBLOX_START_URL}><span class="ico" aria-hidden="true"><i></i></span><span><strong>Continue with Roblox</strong><small>Opens Roblox's sign-in page</small></span><span class="arr" aria-hidden="true">&rarr;</span></a>
			<div class="info">
				<b>New to {SITE_NAME}?</b> The verify command runs from inside our Discord. Jump in first.
				{#if hasInvite}<br /><a href={DISCORD_INVITE} target="_blank" rel="noopener">Join our Discord <span aria-hidden="true">&rarr;</span></a>{/if}
			</div>
			<p class="fine">Roblox shares only what you approve, and we never see your password. You can revoke access any time in your Roblox account settings.</p>
		</div>
	</div>
	<a class="back" href="/">&larr; Back to home</a>
</main>
