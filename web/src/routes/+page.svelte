<script lang="ts">
	import './home.css';
	import { onMount } from 'svelte';
	import { SITE_NAME, SITE_LOGO, DISCORD_INVITE, hasInvite } from '#lib/site.ts';
	import DiscordIcon from '#lib/DiscordIcon.svelte';

	/* ================= CONFIG: edit these ================= */
	const HERO_IMAGE = ''; // optional background photo, e.g. "/img/hero.jpg"
	const HERO_TITLE = ['OHIO STATE', 'ROLEPLAY'];
	const HERO_SUB = "Ohio's #1 Roleplay";
	const PLAY_URL = '#'; // ERLC server link for the Play button (hardcode later)
	const PANEL_URL = '/panel'; // backend checks staff access
	const LOGIN_URL = '/auth/login?mode=public'; // Discord sign-in for anyone (staff also get panel access)
	const LOGOUT_URL = '/auth/logout';
	const ME_URL = '/api/home/me'; // -> { id, username, avatar } or 401
	const REVIEWS_URL = '/api/home/reviews'; // GET -> [{name,stars,text,mine}], POST {stars,text}
	const TEAM_URL = '/api/home/team'; // fills in Discord names/photos left blank below
	const ABOUT_BLOCKS = [
		{ title: 'Strict standards', sub: 'Realistic rules, enforced fairly.',
			bullets: ['Active departments', 'Strict departments', 'Realism'], image: '/img/about-1.jpg' },
		{ title: 'Ohio environment', sub: 'Ohio roads and cities with real character.',
			bullets: ['Highways, cities and small towns', 'Authentic local character', 'Immersive world-building'], image: '/img/about-2.jpg' }
	];
	const TEAM = [
		{ id: '1498514468252942436', role: 'Owner', name: '', photo: '' },
		{ id: '1536879503421345932', role: 'Co-Owner', name: '', photo: '' }
	];
	/* ====================================================== */

	interface User { id: string; username: string; avatar: string }
	interface Review { name: string; stars: number; text: string; mine: boolean }

	let user = $state<User | null>(null);
	let menuOpen = $state(false);
	let team = $state<Record<string, { name?: string; avatar?: string }>>({});
	let brokenPhotos = $state<Record<string, boolean>>({});
	let reviews = $state<Review[]>([]);
	let stars = $state(5);
	let text = $state('');
	let note = $state('');
	let hasReview = $state(false);
	let saving = $state(false);
	let textarea = $state<HTMLTextAreaElement>();
	let strip = $state<HTMLDivElement>();
	let drag = $state<{ x: number; left: number } | null>(null);

	const pfp = $derived(!user ? '' : user.avatar?.startsWith('http') ? user.avatar
		: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
		: 'https://cdn.discordapp.com/embed/avatars/0.png');

	async function loadMe() {
		try {
			const r = await fetch(ME_URL, { credentials: 'include' });
			if (!r.ok) throw 0;
			user = await r.json();
		} catch { user = null; }
	}

	async function loadReviews(initial = true) {
		try {
			const r = await fetch(REVIEWS_URL, { credentials: 'include' });
			if (!r.ok) throw 0;
			reviews = await r.json();
			const mine = reviews.find(x => x.mine);
			hasReview = !!mine;
			if (mine && !text) { stars = mine.stars || 5; text = mine.text; }
			if (initial) note = mine ? 'You already left a review. Edit it here.' : '';
		} catch { reviews = []; }
	}

	async function post() {
		if (text.trim().length < 3) { note = 'Write at least a few words.'; textarea?.focus(); return; }
		saving = true;
		try {
			const r = await fetch(REVIEWS_URL, { method: 'POST', credentials: 'include',
				headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'panel' },
				body: JSON.stringify({ stars, text: text.trim() }) });
			if (!r.ok) throw 0;
			await loadReviews(false);
			note = 'Review saved. You can edit it any time.';
		} catch { note = 'Could not save your review. Try again.'; }
		saving = false;
	}

	async function logout() {
		try { await fetch(LOGOUT_URL, { method: 'POST', credentials: 'include', headers: { 'X-Requested-With': 'panel' } }); } catch {}
		location.reload();
	}

	// scroll the strip: arrows, mouse drag, or swipe / shift+wheel
	const scroll = (left: number) => strip?.scrollBy({ left, behavior: 'smooth' });
	const onPointerDown = (e: PointerEvent) => { if (e.pointerType === 'mouse' && strip) drag = { x: e.clientX, left: strip.scrollLeft }; };
	const onPointerMove = (e: PointerEvent) => { if (drag && strip) strip.scrollLeft = drag.left - (e.clientX - drag.x); };

	onMount(() => {
		loadMe();
		loadReviews();
		fetch(TEAM_URL).then(r => (r.ok ? r.json() : {})).then(t => { team = t; }).catch(() => {});
	});
</script>

<svelte:head>
	<title>{SITE_NAME}</title>
	<meta name="theme-color" content="#000000" />
	<link rel="icon" href={SITE_LOGO} />
	<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<svelte:window onpointermove={onPointerMove} onpointerup={() => (drag = null)} />

<a class="skip" href="#main">Skip to content</a>

<nav>
	<div class="wrap">
		<a class="brand" href="#home"><img alt="" src={SITE_LOGO} width="34" height="34" /><span>{SITE_NAME}</span></a>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="links" class:open={menuOpen} id="links" onclick={e => { if ((e.target as Element).closest('a')) menuOpen = false; }}>
			<a href="#home">Home</a>
			<a href="#about">About</a>
			<a href="#reviews">Reviews</a>
			<a href="#team">Team</a>
			<a href="/verify">Verification</a>
			<a href={PANEL_URL}>Moderation panel</a>
			<span id="authArea">
				{#if user}
					<span class="userbox"><img src={pfp} alt="" width="30" height="30" /><span>{user.username}</span><button class="btn" onclick={logout}>Sign out</button></span>
				{:else}
					<a class="btn primary" href={LOGIN_URL}><DiscordIcon />Sign in with Discord</a>
				{/if}
			</span>
		</div>
		<button class="menu" aria-label="Menu" aria-expanded={menuOpen} aria-controls="links" onclick={() => (menuOpen = !menuOpen)}>&#9776;</button>
	</div>
</nav>

<header class="hero" id="home" style={HERO_IMAGE ? `--hero-img: url("${HERO_IMAGE}")` : undefined}>
	<div class="wrap">
		<h1>{#each HERO_TITLE as line, i}{#if i}<br />{/if}{line}{/each}<i></i></h1>
		<div class="tag"><span>{HERO_SUB}</span><span class="chip">Community</span></div>
		<div class="cta">
			{#if PLAY_URL && PLAY_URL !== '#'}<a class="btn primary" href={PLAY_URL} target="_blank" rel="noopener">Play</a>{/if}
			{#if hasInvite}<a class="btn" href={DISCORD_INVITE} target="_blank" rel="noopener"><DiscordIcon />Discord</a>{/if}
		</div>
	</div>
</header>

<main id="main">
	<section class="about" id="about">
		<div class="wrap">
			<h2>About<i>.</i></h2>
			<div class="rule"></div>
			<div>
				{#each ABOUT_BLOCKS as b, i}
					<div class="row" class:flip={i % 2}>
						<div><h3>{b.title}</h3><p class="sub">{b.sub}</p><ul>{#each b.bullets as x}<li>{x}</li>{/each}</ul></div>
						<div class="pic"><img src={b.image} alt={b.title} width="900" height="450" loading="lazy" /></div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="reviews" id="reviews">
		<div class="wrap">
			<div class="rhead"><h2>Reviews<i>.</i></h2><div class="arrows"><button class="btn" aria-label="Previous reviews" onclick={() => scroll(-528)}>&#8249;</button><button class="btn" aria-label="Next reviews" onclick={() => scroll(528)}>&#8250;</button></div></div>
			<div class="rule"></div>
		</div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="marquee" class:drag={!!drag} bind:this={strip} onpointerdown={onPointerDown}>
			<div class="track">
				{#each reviews as r}
					<div class="rev"><b>{r.name}</b><div class="stars" role="img" aria-label="{r.stars || 5} out of 5 stars">{'★'.repeat(r.stars || 5)}</div><p>{r.text}</p></div>
				{:else}
					<p class="note">No reviews yet. Leave the first one below.</p>
				{/each}
			</div>
		</div>
		{#if reviews.length}<p class="loved">Loved by our <b>players</b></p>{/if}
		<div class="wrap">
			{#if user}
				<div class="form">
					<div class="rate" role="group" aria-label="Rating">
						{#each [1, 2, 3, 4, 5] as n}
							<button type="button" class:on={n <= stars} aria-label="{n} star{n > 1 ? 's' : ''}" aria-pressed={n === stars} onclick={() => (stars = n)}>★</button>
						{/each}
					</div>
					<label for="reviewText">Your review</label>
					<textarea id="reviewText" name="review" maxlength="240" autocomplete="off" placeholder="What you like about the server…" bind:value={text} bind:this={textarea}></textarea>
					<div class="post">
						<button class="btn primary" disabled={saving} onclick={post}>{saving ? 'Saving…' : hasReview ? 'Save changes' : 'Post review'}</button>
						<span class="note" aria-live="polite">{note}</span>
					</div>
				</div>
			{:else}
				<p class="note" id="reviewLogin">Sign in with Discord to leave a review.</p>
			{/if}
		</div>
	</section>

	<section class="team" id="team">
		<div class="wrap">
			<h2>The team<i>.</i></h2>
			<div class="rule"></div>
			<div class="tgrid">
				{#each TEAM as m}
					{@const info = team[m.id] || {}}
					{@const photo = m.photo || info.avatar || ''}
					<div class="member">
						<img src={photo || undefined} style:visibility={photo && !brokenPhotos[m.id] ? undefined : 'hidden'} alt="" width="70" height="70" onerror={() => (brokenPhotos[m.id] = true)} />
						<div><h3>{m.name || info.name || m.role}</h3><span>{m.role}</span>
							<a class="btn" href="https://discord.com/users/{m.id}" target="_blank" rel="noopener">Contact</a></div>
					</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<footer>© {new Date().getFullYear()} {SITE_NAME}</footer>
