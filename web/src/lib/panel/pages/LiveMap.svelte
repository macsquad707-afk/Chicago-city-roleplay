<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Icon from '../Icon.svelte';
	import { api } from '../api';
	import { FLIP_Z, LIVE_POLL_MS, MAP_BOUNDS, MAP_FALLBACKS, MAP_URL, SHOW_COORDS, normalizePlayers, teamColor } from '../config';
	import { isRobloxId } from '../format';
	import type { Player } from '../types';

	let players = $state<Player[]>([]), failed = $state(false);
	let filter = $state('all'), query = $state(''), selected = $state<string | null>(null);
	let iw = $state(0), ih = $state(0), fit = 1;
	let view = $state({ s: 1, tx: 0, ty: 0 });
	let grid = $state(true), grabbing = $state(false), imgError = $state(false), coords = $state('');
	let src = $state(MAP_URL);
	const fallbacks = [...MAP_FALLBACKS];
	let map = $state<HTMLDivElement>(), card = $state<HTMLDivElement>();
	let cardPos = $state<{ left: number; top: number } | null>(null);
	let avatarFailed = $state(''); // id whose card avatar didn't load

	const teams = $derived([...new Set(players.map(p => p.team))]);
	const active = $derived(filter === 'all' || teams.includes(filter) ? filter : 'all');
	const visible = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return players.filter(p => (active === 'all' || p.team === active) &&
			(!q || p.name.toLowerCase().includes(q) || (p.callsign || '').toLowerCase().includes(q)));
	});
	const sel = $derived(selected ? players.find(x => x.name === selected) : undefined);
	const where = (p: Player) => [p.postal ? 'Postal ' + p.postal : '', p.street].filter(Boolean).join(' · ');
	const placed = (p: Player): p is Player & { x: number; z: number } => Number.isFinite(p.x) && Number.isFinite(p.z);

	const toPx = (p: { x: number; z: number }) => {
		const b = MAP_BOUNDS, fz = (p.z - b.zMin) / (b.zMax - b.zMin);
		return { x: (p.x - b.xMin) / (b.xMax - b.xMin) * iw, y: (FLIP_Z ? 1 - fz : fz) * ih };
	};
	const fitView = () => {
		const r = map?.getBoundingClientRect();
		if (!iw || !r?.width) return;
		fit = Math.min(r.width / iw, r.height / ih) * 0.96;
		view = { s: fit, tx: (r.width - iw * fit) / 2, ty: (r.height - ih * fit) / 2 };
	};
	const zoomAt = (f: number, cx: number, cy: number) => {
		const ns = Math.min(fit * 12, Math.max(fit * 0.6, view.s * f)), k = ns / view.s;
		view = { s: ns, tx: cx - (cx - view.tx) * k, ty: cy - (cy - view.ty) * k };
	};
	const zoomCenter = (f: number) => { const r = map!.getBoundingClientRect(); zoomAt(f, r.width / 2, r.height / 2); };
	const centerOn = (p: { x: number; z: number }) => {
		const r = map!.getBoundingClientRect(), pt = toPx(p), s = Math.max(view.s, fit * 3);
		view = { s, tx: r.width / 2 - pt.x * s, ty: r.height / 2 - pt.y * s };
	};

	const onImgLoad = (e: Event) => {
		const img = e.currentTarget as HTMLImageElement;
		iw = img.naturalWidth; ih = img.naturalHeight;
		fitView();
	};
	const onImgError = () => { if (fallbacks.length) src = fallbacks.shift()!; else imgError = true; };

	const pick = (p: Player, center: boolean) => { selected = p.name; if (center && placed(p)) centerOn(p); };

	// pan + zoom
	let drag: { x: number; y: number; tx: number; ty: number; id: number } | null = null, dragMoved = false;
	const onDown = (e: PointerEvent) => {
		if ((e.target as Element).closest('.lm-ctrl,.lm-card')) return;
		drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, id: e.pointerId };
		dragMoved = false;
	};
	const onMove = (e: PointerEvent) => {
		if (drag) {
			const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
			if (!dragMoved && Math.hypot(dx, dy) > 4) { dragMoved = true; map!.setPointerCapture(drag.id); grabbing = true; }
			if (dragMoved) view = { ...view, tx: drag.tx + dx, ty: drag.ty + dy };
		}
		if (SHOW_COORDS && iw) {
			const r = map!.getBoundingClientRect(), b = MAP_BOUNDS;
			const fx = (e.clientX - r.left - view.tx) / view.s / iw;
			let fz = (e.clientY - r.top - view.ty) / view.s / ih; if (FLIP_Z) fz = 1 - fz;
			coords = `X ${Math.round(b.xMin + fx * (b.xMax - b.xMin))} · Z ${Math.round(b.zMin + fz * (b.zMax - b.zMin))}`;
		}
	};
	const endDrag = () => { drag = null; grabbing = false; };
	const onMapClick = (e: MouseEvent) => {
		if (dragMoved || (e.target as Element).closest('.lm-pin,.lm-ctrl,.lm-card')) return;
		selected = null;
	};
	const onWheel = (e: WheelEvent) => {
		e.preventDefault();
		const r = map!.getBoundingClientRect();
		zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
	};

	// drag the details card around the map; buttons and links still click
	const onCardDown = (e: PointerEvent) => {
		if (e.button !== 0 || (e.target as Element).closest('button,a')) return;
		e.preventDefault();
		const el = card!, box = (el.offsetParent as HTMLElement).getBoundingClientRect(), c = el.getBoundingClientRect();
		const ox = e.clientX - c.left, oy = e.clientY - c.top;
		const move = (ev: PointerEvent) => {
			cardPos = { left: Math.min(Math.max(0, ev.clientX - box.left - ox), box.width - c.width), top: Math.min(Math.max(0, ev.clientY - box.top - oy), box.height - c.height) };
		};
		const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
		el.setPointerCapture(e.pointerId);
		el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
	};

	const fullscreen = () => { if (document.fullscreenElement) document.exitFullscreen(); else map?.requestFullscreen?.(); };
	const onFs = () => setTimeout(fitView, 50);

	// live data
	const poll = async () => {
		try { players = normalizePlayers(await api('/api/players')); failed = false; }
		catch { failed = true; }
	};
	poll();
	const timer = setInterval(poll, LIVE_POLL_MS);
	onMount(() => {
		// wheel needs a non-passive listener so the page doesn't scroll while zooming
		map!.addEventListener('wheel', onWheel, { passive: false });
		document.addEventListener('fullscreenchange', onFs);
		return () => { map?.removeEventListener('wheel', onWheel); document.removeEventListener('fullscreenchange', onFs); };
	});
	onDestroy(() => clearInterval(timer));
</script>

<div id="view" class="enter">
	<div class="lm">
		<aside class="lm-side">
			<div class="lm-head">
				<h2>Live map</h2>
				<p>{failed ? "Can't reach the server · retrying" : `${players.length} ${players.length === 1 ? 'player' : 'players'} · updates every few seconds`}</p>
				<label class="search"><Icon name="search" /><input type="search" placeholder="Find a player" autocomplete="off" aria-label="Find a player" bind:value={query} /></label>
				<div class="pills">
					<button class="pill" class:active={active === 'all'} onclick={() => (filter = 'all')}>All <span class="n">{players.length}</span></button>
					{#each teams as t (t)}
						<button class="pill" class:active={active === t} style:--dot={teamColor(t)} onclick={() => (filter = t)}><span class="dot"></span>{t} <span class="n">{players.filter(p => p.team === t).length}</span></button>
					{/each}
				</div>
			</div>
			<div class="lm-list">
				{#each visible as p (p.name)}
					<button class="lm-row" class:sel={p.name === selected} style:--c={teamColor(p.team)} onclick={() => pick(p, true)}>
						<i></i><b>{p.name}</b><span>{p.callsign || (p.postal ? 'P' + p.postal : '')}</span>
					</button>
				{/each}
			</div>
		</aside>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="lm-map" class:nogrid={!grid} class:grabbing bind:this={map} style:background-position="{view.tx}px {view.ty}px"
			onpointerdown={onDown} onpointermove={onMove} onpointerup={endDrag} onpointercancel={endDrag} onclick={onMapClick}>
			<div class="lm-stage" style:width={iw ? iw + 'px' : undefined} style:height={ih ? ih + 'px' : undefined}
				style:transform="translate({view.tx}px,{view.ty}px) scale({view.s})" style:--inv={String(1 / view.s)}>
				<img {src} alt="ER:LC map" draggable="false" referrerpolicy="no-referrer" onload={onImgLoad} onerror={onImgError} />
				<div id="lmLayer">
					{#if iw}
						{#each visible.filter(placed) as p (p.name)}
							{@const pt = toPx(p)}
							<button class="lm-pin" class:sel={p.name === selected} aria-label={p.name} style:left="{pt.x}px" style:top="{pt.y}px" style:--c={teamColor(p.team)} onclick={() => pick(p, false)}>
								<span class="lm-tip"><b>{p.name}</b><span>{p.team}{p.callsign ? ' · ' + p.callsign : ''}</span>{#if where(p)}<span>{where(p)}</span>{/if}</span>
							</button>
						{/each}
					{/if}
				</div>
			</div>
			{#if imgError}<div class="lm-note">Couldn't load the map image. Download it and set MAP_URL to your own copy.</div>{/if}
			<div class="lm-ctrl">
				<div class="lm-grp">
					<button class="lm-btn" type="button" aria-label="Toggle grid" aria-pressed={grid} onclick={() => (grid = !grid)}><Icon name="hash" /></button>
					<button class="lm-btn" type="button" aria-label="Reset view" onclick={fitView}><Icon name="target" /></button>
				</div>
				<div class="lm-grp">
					<button class="lm-btn" type="button" aria-label="Zoom in" onclick={() => zoomCenter(1.4)}><Icon name="plus" /></button>
					<button class="lm-btn" type="button" aria-label="Zoom out" onclick={() => zoomCenter(1 / 1.4)}><Icon name="minus" /></button>
					<button class="lm-btn" type="button" aria-label="Fullscreen" onclick={fullscreen}><Icon name="expand" /></button>
				</div>
			</div>
			{#if sel}
					<div class="lm-card" bind:this={card} role="presentation" style:--c={teamColor(sel.team)} style:left={cardPos ? cardPos.left + 'px' : undefined} style:top={cardPos ? cardPos.top + 'px' : undefined} onpointerdown={onCardDown}>
						<button class="lm-btn lm-card-x" type="button" aria-label="Close" onclick={() => (selected = null)}><Icon name="close" /></button>
						<div class="lm-card-av">{#if isRobloxId(sel.id) && avatarFailed !== sel.id}<img src="/api/roblox/avatar/{sel.id}" width="170" height="170" alt="{sel.name}'s Roblox avatar" draggable="false" onerror={() => (avatarFailed = sel.id)} />{/if}</div>
						<div class="lm-card-body">
							<h3>{sel.name}</h3>
							<dl>
								<dt>Team</dt><dd><i></i>{sel.team}</dd>
								{#if sel.callsign}<dt>Callsign</dt><dd>{sel.callsign}</dd>{/if}
								<dt>Permission</dt><dd>{sel.permission}</dd>
								{#if where(sel)}<dt>Location</dt><dd>{where(sel)}</dd>{/if}
								{#if sel.id}<dt>User ID</dt><dd class="mono">{sel.id}</dd>{/if}
							</dl>
							{#if isRobloxId(sel.id)}<a href="https://www.roblox.com/users/{sel.id}/profile" target="_blank" rel="noopener noreferrer">Roblox profile</a>{/if}
						</div>
					</div>
			{/if}
			{#if SHOW_COORDS && coords}<div class="lm-coords">{coords}</div>{/if}
			<div class="lm-credit">Map: ER:LC</div>
		</div>
	</div>
</div>
