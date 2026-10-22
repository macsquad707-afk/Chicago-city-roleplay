<script lang="ts">
	import { onMount } from 'svelte';
	import Avatar from '../Avatar.svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import RoleBadges from '../RoleBadges.svelte';
	import Strikes from '../Strikes.svelte';
	import EditRoles from '../dialogs/EditRoles.svelte';
	import StaffProfile from '../dialogs/StaffProfile.svelte';
	import { portal } from '../actions';
	import { api } from '../api';
	import { toast } from '../dialogs.svelte';
	import { DAY_MS, fmtDur, plural } from '../format';
	import type { IconName } from '../icons';
	import { S, ago, clock, isOnShift, weekSecondsFor } from '../store.svelte';
	import type { StaffMember } from '../types';

	let filter = $state('everyone'), query = $state('');
	let profile = $state<StaffMember | null>(null), editing = $state<StaffMember | null>(null);
	// row menu: the backend re-checks every action and answers with the fresh staff list
	let menu = $state<{ m: StaffMember; btn: HTMLElement; left: number; top: number } | null>(null);
	let menuEl = $state<HTMLDivElement>();

	const present = $derived([...new Map(S.staff.map(m => [m.rank, m.rankColor])).entries()]); // S.staff is sorted highest role first
	const active = $derived(present.some(([r]) => r === filter) ? filter : 'everyone');
	const rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return S.staff.filter(m => (active === 'everyone' || m.rank === active) && (!q || m.name.toLowerCase().includes(q) || (m.handle || '').toLowerCase().includes(q)));
	});
	const onShift = $derived(S.staff.filter(m => isOnShift(m.name)).length);
	const weekLogs = (m: StaffMember) => S.moderations.filter(x => x.mod === m.name && clock.now - x.at < 7 * DAY_MS).length;

	const closeMenu = (refocus = false) => {
		if (refocus && menu?.btn.isConnected) menu.btn.focus();
		menu = null;
	};
	const toggleMenu = (e: MouseEvent, m: StaffMember) => {
		e.stopPropagation();
		const btn = e.currentTarget as HTMLElement;
		if (menu?.btn === btn) return closeMenu();
		menu = { m, btn, left: -9999, top: 0 };
	};
	// place the menu under its button once it's drawn, flipping up near the bottom of the screen
	$effect(() => {
		if (!menu || !menuEl || menu.left !== -9999) return;
		const r = menu.btn.getBoundingClientRect(), mw = menuEl.offsetWidth, mh = menuEl.offsetHeight;
		menu.left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw));
		menu.top = r.bottom + mh + 8 > window.innerHeight ? Math.max(8, r.top - mh - 4) : r.bottom + 4;
		menuEl.querySelector<HTMLElement>('button:not(:disabled)')?.focus();
	});
	const menuItems = (m: StaffMember): { label: string; icon: IconName; off: boolean; run: () => void }[] => {
		const act = (path: string, body: object) => async () => {
			try { S.staff = await api(`/api/staff/${m.id}/${path}`, body); } catch (err) { toast((err as Error).message); }
		};
		return [
			{ label: 'Edit roles', icon: 'roles', off: !m.assignable.length, run: () => (editing = m) },
			{ label: 'Add strike', icon: 'warn', off: !m.canManage || m.strikes >= S.maxStrikes, run: act('strike', { delta: 1 }) },
			{ label: 'Remove strike', icon: 'minus', off: !m.canManage || m.strikes <= 0, run: act('strike', { delta: -1 }) }
		];
	};

	onMount(() => {
		const onDoc = (e: MouseEvent) => { if (menu && !menuEl?.contains(e.target as Node) && !(e.target as Element).closest('.dots-btn')) closeMenu(); };
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && menu) closeMenu(true); };
		const onScroll = () => closeMenu();
		const content = document.querySelector('.content');
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		window.addEventListener('resize', onScroll);
		content?.addEventListener('scroll', onScroll);
		return () => {
			document.removeEventListener('mousedown', onDoc);
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', onScroll);
			content?.removeEventListener('scroll', onScroll);
		};
	});
</script>

<PageHead title="Staff" sub="{S.staff.length} on the staff team · {onShift} on shift" />
<div id="view" class="enter">
	<div class="seg" role="tablist">
		<button role="tab" aria-selected="true" class="active"><Icon name="players" />Team <span class="n">{S.staff.length}</span></button>
	</div>
	<div class="staff-body">
		<div class="filter-row">
			<div class="pills" style="margin:0">
				<button class="pill" class:active={active === 'everyone'} onclick={() => (filter = 'everyone')}>Everyone <span class="n">{S.staff.length}</span></button>
				{#each present as [r, c] (r)}
					<button class="pill" class:active={active === r} style:--dot={c} onclick={() => (filter = r)}><span class="dot"></span>{r} <span class="n">{S.staff.filter(m => m.rank === r).length}</span></button>
				{/each}
			</div>
			<span class="spacer"></span>
			<label class="search"><Icon name="search" /><input type="search" placeholder="Search staff" autocomplete="off" aria-label="Search staff" bind:value={query} /></label>
		</div>
		{#if rows.length}
			<div class="table-wrap"><table class="players">
				<thead><tr><th>Staff member</th><th>Roles</th><th>Strikes</th><th>Status</th><th>This week</th><th>Since</th><th></th></tr></thead>
				<tbody>
					{#each rows as m (m.id)}
						{@const logs = weekLogs(m)}
						<tr class="staff-row" tabindex="0" aria-label="Open {m.name}'s profile" onclick={() => (profile = m)}
							onkeydown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); profile = m; } }}>
							<td><div class="pl"><Avatar name={m.name} url={m.avatar} cls="lg" /><div class="who"><div><b>{m.name}</b>{#if m.id === S.me?.id}<span class="you">you</span>{/if}</div><small>@{m.handle || ''}</small></div></div></td>
							<td><span class="role-list"><RoleBadges {m} /></span></td>
							<td><Strikes n={m.strikes} /></td>
							<td>{#if isOnShift(m.name)}<span class="onshift">On shift</span>{:else}Off shift{/if}</td>
							<td class="wk"><b>{fmtDur(weekSecondsFor(m.name))}</b> &middot; {plural(logs, 'log', 'logs')}</td>
							<td style="white-space:nowrap">{ago(m.since)}</td>
							<td class="r">
								{#if m.canManage || m.assignable.length}
									<button class="dots-btn" type="button" aria-label="Actions for {m.name}" aria-haspopup="menu" onclick={e => toggleMenu(e, m)}><Icon name="more" /></button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table></div>
		{:else}
			<div class="empty-card"><Icon name="players" /><b>No staff match</b></div>
		{/if}
	</div>
</div>

{#if menu}
	<div class="menu" role="menu" bind:this={menuEl} use:portal style:left="{menu.left}px" style:top="{menu.top}px">
		{#each menuItems(menu.m) as it}
			<button type="button" role="menuitem" disabled={it.off} onclick={() => { closeMenu(); it.run(); }}><Icon name={it.icon} />{it.label}</button>
		{/each}
	</div>
{/if}
{#if profile}<StaffProfile member={profile} onclose={() => (profile = null)} />{/if}
{#if editing}<EditRoles m={editing} onclose={() => (editing = null)} />{/if}
