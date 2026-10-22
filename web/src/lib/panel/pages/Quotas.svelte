<script lang="ts">
	import { onDestroy } from 'svelte';
	import Avatar from '../Avatar.svelte';
	import Box from '../Box.svelte';
	import Empty from '../Empty.svelte';
	import FormDialog from '../FormDialog.svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import { api } from '../api';
	import { ask, toast } from '../dialogs.svelte';
	import { DAY_MS, fmtDay, fmtDur, isoDay, nextWeekStart, plural } from '../format';
	import { S, applyConfig, can } from '../store.svelte';

	interface WeekRow { id: string; name: string; avatar: string; rank: string; rankColor: string; secs: number; goal: number; status: 'met' | 'behind' | 'leave' | 'none'; leaveDays: number }
	interface Leave { id: number; name: string; avatar: string; start: string; end: string; reason: string; status: 'pending' | 'approved' | 'denied'; mine: boolean; canDecide: boolean }
	interface Quotas { enabled: boolean; since: number; hours: Record<string, number>; week: WeekRow[]; leave: Leave[]; past: { start: number; met: number; total: number; missed: string[] }[] }

	let data = $state<Quotas | null>(null), error = $state('');
	let requesting = $state(false), settingsOpen = $state(false);
	let busyLeave = $state<number | null>(null);

	const fmtH = (s: number) => fmtDur(s).replace(/ 0m$/, '');
	const pct = (r: WeekRow) => r.goal ? Math.min(100, r.secs / r.goal * 100).toFixed(1) : 0;
	const STATUS = { met: ['Met', '#22c55e'], behind: ['Behind', '#f5a623'], leave: ['On leave', '#22b8cf'], none: ['No quota', '#858585'] } as const;
	const LEAVE = { pending: ['Waiting', '#f5a623'], approved: ['Approved', '#22c55e'], denied: ['Denied', '#ef4444'] } as const;
	// bar color: status when there's a goal, otherwise the person's rank color
	const barColor = (r: WeekRow) => r.status === 'none' ? r.rankColor : STATUS[r.status][1];
	const span = (a: string, b: string) => a === b ? fmtDay(a) : `${fmtDay(a)} to ${fmtDay(b)}`;
	const days = Math.ceil((nextWeekStart() - Date.now()) / DAY_MS);

	const me = $derived(data?.week.find(r => r.id === S.me?.id));
	const met = $derived(data ? data.week.filter(r => r.status === 'met').length : 0);
	// most time first; the sort is stable, so ties keep the server's rank order
	const sorted = $derived(data ? [...data.week].sort((a, b) => b.secs - a.secs) : []);
	const top = $derived(Math.max(1, ...sorted.map(r => r.secs)));

	const load = () => api<Quotas>('/api/quotas').then(x => { data = x; error = ''; }).catch(err => { error = err.message; });
	load();
	const timer = setInterval(load, 30000);
	onDestroy(() => clearInterval(timer));

	const decide = async (l: Leave, action: 'approve' | 'deny' | 'cancel') => {
		if (action === 'cancel' && !await ask({ title: 'Cancel this leave?', ok: 'Cancel leave', no: 'Keep leave', danger: true })) return;
		busyLeave = l.id;
		try { await api('/api/leave/' + l.id, { action }); } catch (err) { toast((err as Error).message); }
		busyLeave = null;
		load();
	};

	// Request leave form
	const today = isoDay(Date.now());
	let start = $state(today), end = $state(''), reason = $state('');
	const sendLeave = async () => { await api('/api/leave', { start, end, reason }); load(); };
	const openRequest = () => { start = today; end = ''; reason = ''; requesting = true; };

	// Quota settings form
	let qEnabled = $state(false), qHours = $state<Record<string, number>>({});
	const openSettings = () => {
		if (!data) return;
		qEnabled = data.enabled;
		qHours = Object.fromEntries(S.roles.map(r => [String(r.id), data!.hours[r.id] ?? 0]));
		settingsOpen = true;
	};
	const saveSettings = async () => {
		applyConfig(await api('/api/settings', { quotas: { enabled: qEnabled, hours: qHours } }));
		load();
	};
</script>

{#snippet badge([label, c]: readonly [string, string])}<span class="badge" style:--c={c}>{label}</span>{/snippet}

<PageHead title="Quotas & leave" sub="Weekly hours on shift. The week resets Monday 00:00 UTC, in {plural(days, 'day', 'days')}.">
	{#snippet tools()}
		<div class="q-tools">
			<button class="btn-ghost btn-sm" type="button" onclick={openRequest}><Icon name="leave" />Request leave</button>
			{#if can('settings.manage')}<button class="btn-ghost btn-sm" type="button" onclick={openSettings}><Icon name="settings" />Settings</button>{/if}
		</div>
	{/snippet}
</PageHead>
<div id="view" class="enter">
	{#if data && !data.enabled}
		<div class="q-banner">Quotas are off. {can('settings.manage') ? 'Turn them on in Settings: the' : 'Someone who manages settings can turn them on. The'} first week checked is the next full one. Leave requests still work.</div>
	{:else if data && data.since > Date.now()}
		<div class="q-banner">Quotas start {fmtDay(isoDay(data.since))}. This week isn't checked.</div>
	{/if}
	<div class="q-grid">
		<div class="q-col">
			<Box title="Your week" icon="quotas">
				<div class="q-mine">
					{#if data && !me}<p class="q-note">You're not on the staff list.</p>
					{:else if data && me}
						<div class="q-big" style:--c={barColor(me)}>{fmtH(me.secs)}</div>
						<div class="lb-bar q-bar" style:--c={barColor(me)}><i style:width="{pct(me)}%"></i></div>
						<p class="q-note">{!data.enabled ? 'Quotas are off.'
							: me.status === 'none' ? 'Your rank has no weekly goal.'
							: me.status === 'leave' ? "You're on leave all week."
							: me.status === 'met' ? `Goal of ${fmtH(me.goal)} met.`
							: `${fmtH(me.goal - me.secs)} left of ${fmtH(me.goal)}.`}{me.leaveDays && me.status !== 'leave' ? ` Lowered for ${plural(me.leaveDays, 'day', 'days')} of leave.` : ''}</p>
					{/if}
				</div>
			</Box>
			<Box title="Leave" icon="leave">
				<div>
					{#each data?.leave ?? [] as l (l.id)}
						<div class="q-leave">
							<Avatar name={l.name} url={l.avatar} cls="lg" />
							<div class="q-who"><b>{l.mine ? 'You' : l.name} {@render badge(LEAVE[l.status])}</b><span>{span(l.start, l.end)}</span><span title={l.reason}>{l.reason}</span></div>
							<div class="q-acts">
								{#if l.canDecide}
									<button class="btn-ghost btn-sm" type="button" disabled={busyLeave === l.id} onclick={() => decide(l, 'approve')}><Icon name="check" />Approve</button>
									<button class="btn-ghost btn-sm" type="button" disabled={busyLeave === l.id} onclick={() => decide(l, 'deny')}><Icon name="close" />Deny</button>
								{/if}
								{#if l.mine}<button class="btn-ghost btn-sm" type="button" disabled={busyLeave === l.id} onclick={() => decide(l, 'cancel')}><Icon name="cancelleave" />Cancel</button>{/if}
							</div>
						</div>
					{:else}
						{#if data}<Empty icon="leave" text="No leave coming up" h={120} />{/if}
					{/each}
				</div>
				<p class="q-foot">Approved leave lowers the weekly goal by the days you're away.</p>
			</Box>
		</div>
		<div class="q-col">
			<Box title="This week" icon="staff">
				{#snippet extra()}<span class="q-count" class:good={met > 0}>{data ? `${met} met` : ''}</span>{/snippet}
				<div>
					{#if error && !data}<div class="placeholder">{error}</div>
					{:else if !data}<Empty icon="loading" text="Loading…" h={120} />
					{:else}
						{#each sorted as r, i (r.id)}
							<div class="q-row" class:lead={i === 0 && r.secs > 0}>
								<span class="lb-rank">{#if i === 0 && r.secs > 0}<Icon name="crown" />{:else}{i + 1}{/if}</span>
								<Avatar name={r.name} url={r.avatar} cls="lg" />
								<div class="q-who"><b>{r.name}</b><span style:color={r.rankColor}>{r.rank}</span></div>
								<div class="lb-bar q-bar" style:--c={barColor(r)}><i style:width="{r.goal ? pct(r) : (r.secs / top * 100).toFixed(1)}%"></i></div>
								<span class="q-time">{fmtH(r.secs)}{#if r.goal}<span>/{fmtH(r.goal)}</span>{/if}</span>
								{@render badge(STATUS[r.status])}
							</div>
						{:else}
							<Empty icon="staff" text="No staff found" h={120} />
						{/each}
					{/if}
				</div>
			</Box>
			<Box title="Past weeks" icon="history">
				<div>
					{#each data?.past ?? [] as p}
						<div class="q-past"><b>Week of {fmtDay(isoDay(p.start))}</b><span class={p.total && p.met === p.total ? 'good' : p.missed.length ? 'warn' : ''}>{p.met} of {p.total} met</span>
							{#if p.missed.length}<small>Missed: {p.missed.join(', ')}</small>{/if}</div>
					{:else}
						{#if data}<div class="q-empty"><Icon name="history" /><b>No finished weeks yet</b><span>Each week is checked when it ends.</span></div>{/if}
					{/each}
				</div>
			</Box>
		</div>
	</div>
</div>

{#if requesting}
	<FormDialog title="Request leave" sub="An admin reviews it. Approved days lower your weekly goal." submitLabel="Send request" onsubmit={sendLeave} onclose={() => (requesting = false)}>
		<div class="q-pair">
			<label class="field"><span>First day <em>*</em></span><input type="date" min={today} bind:value={start} /></label>
			<label class="field"><span>Last day <em>*</em></span><input type="date" min={today} bind:value={end} /></label>
		</div>
		<label class="field"><span>Reason <em>*</em></span><textarea maxlength="300" placeholder="e.g. exams, travelling" bind:value={reason}></textarea>
			<small>Dates are in UTC. Admins see the reason when they review it.</small></label>
	</FormDialog>
{/if}

{#if settingsOpen}
	<FormDialog title="Quota settings" sub="Weekly hours each role should spend on shift. People with several roles get the biggest goal." submitLabel="Save quotas" onsubmit={saveSettings} onclose={() => (settingsOpen = false)}>
		<label class="pm"><span class="pm-text">Check weekly quotas<small>The first week checked is the next full one.</small></span>
			<span class="switch"><input type="checkbox" bind:checked={qEnabled} /><i></i></span></label>
		<div class="q-pair">
			{#each S.roles as r (r.id)}
				<label class="field"><span>{r.name} (hours)</span><input type="number" min="0" max="168" step="0.5" bind:value={qHours[String(r.id)]} /></label>
			{/each}
		</div>
		<p class="q-note">0 means no goal for that role.</p>
	</FormDialog>
{/if}
