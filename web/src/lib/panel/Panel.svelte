<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import './panel.css';
	import DialogHost from './DialogHost.svelte';
	import Icon from './Icon.svelte';
	import { api } from './api';
	import { DEFAULT_PAGE, NAV } from './config';
	import { S, applyConfig, clock, refresh } from './store.svelte';
	import type { Me } from './types';
	import Bans from './pages/Bans.svelte';
	import Commands from './pages/Commands.svelte';
	import LiveMap from './pages/LiveMap.svelte';
	import Moderations from './pages/Moderations.svelte';
	import Overview from './pages/Overview.svelte';
	import Players from './pages/Players.svelte';
	import Quotas from './pages/Quotas.svelte';
	import Roles from './pages/Roles.svelte';
	import ServerLogs from './pages/ServerLogs.svelte';
	import Settings from './pages/Settings.svelte';
	import Shifts from './pages/Shifts.svelte';
	import Staff from './pages/Staff.svelte';

	const PAGES: Record<string, Component> = {
		overview: Overview, players: Players, livemap: LiveMap, moderations: Moderations, bans: Bans, serverlogs: ServerLogs,
		commands: Commands, staff: Staff, shifts: Shifts, quotas: Quotas, roles: Roles, settings: Settings
	};

	let ready = $state(false), error = $state('');
	let hash = $state(location.hash.slice(1));
	let closed = $state(false);
	try { closed = localStorage.getItem('sideClosed') === '1'; } catch {}

	const nav = $derived(NAV.map(g => ({ ...g, items: g.items.filter(i => S.pages.includes(i.id)) })).filter(g => g.items.length));
	const flat = $derived(nav.flatMap(g => g.items));
	const page = $derived(flat.find(p => p.id === hash) || flat.find(p => p.id === DEFAULT_PAGE) || flat[0]);
	const View = $derived(page ? PAGES[page.id] : null);

	// Collapses the sidebar to icons; remembered per browser.
	$effect(() => {
		document.body.classList.toggle('side-closed', closed);
		try { localStorage.setItem('sideClosed', closed ? '1' : ''); } catch {}
	});
	$effect(() => { document.title = page ? page.label + ' | Ohio Moderation' : 'Ohio Moderation'; });
	$effect(() => { if (page) document.querySelector(`.item[data-id="${page.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });

	const logout = () => api('/auth/logout', {}).catch(() => {}).finally(() => { location.href = '/login'; });

	onMount(() => {
		const onHash = () => (hash = location.hash.slice(1));
		window.addEventListener('hashchange', onHash);
		const tick = setInterval(() => (clock.now = Date.now()), 1000);
		let poll: ReturnType<typeof setInterval>;
		(async () => {
			try {
				const me = await api<Me>('/api/me');
				S.me = me; S.perms = me.perms; S.pages = me.pages;
				applyConfig(me.config);
			} catch (e) { error = (e as Error).message; return; }
			await refresh();
			ready = true;
			// Keep shared data fresh. Pages redraw only what changed, so typing isn't interrupted.
			poll = setInterval(refresh, 15000);
		})();
		return () => { window.removeEventListener('hashchange', onHash); clearInterval(tick); clearInterval(poll); };
	});
</script>

<aside class="sidebar" aria-label="Moderator navigation">
	<div class="side-top">
		<span class="side-name"><img src="/logo.webp" alt="" width="28" height="28" /><span class="lbl">Ohio Moderation</span></span>
		<button class="side-toggle" type="button" aria-expanded={!closed} aria-label={closed ? 'Open sidebar' : 'Close sidebar'} title={closed ? 'Open sidebar' : 'Close sidebar'} onclick={() => (closed = !closed)}>
			<Icon name="sidebar" />
		</button>
	</div>
	{#each nav as g (g.group)}
		<div class="group">
			<div class="group-label">{g.group}</div>
			{#each g.items as i (i.id)}
				<a class="item" class:active={i.id === page?.id} href="#{i.id}" data-id={i.id} title={i.label} aria-current={i.id === page?.id ? 'page' : undefined}>
					<Icon name={i.id} />
					<span class="lbl">{i.label}</span>
				</a>
			{/each}
		</div>
	{/each}
	<button class="item logout" type="button" onclick={logout}>
		<Icon name="logout" />
		<span class="lbl">Log out</span>
	</button>
</aside>

<main class="content" class:flush={page?.id === 'livemap'}>
	{#if error}
		<div class="page-head"><div><h1>Couldn't load panel</h1><p class="sub"></p></div></div>
		<div id="view"><div class="placeholder">{error}</div></div>
	{:else if ready && page && View}
		<!-- keyed, so the page-enter animation plays only when the page changes -->
		{#key page.id}<View />{/key}
	{/if}
</main>

<DialogHost />
