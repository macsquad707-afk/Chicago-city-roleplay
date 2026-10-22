<script lang="ts">
	import Avatar from '../Avatar.svelte';
	import Box from '../Box.svelte';
	import Empty from '../Empty.svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import { api } from '../api';
	import { toast } from '../dialogs.svelte';
	import { DAY_MS, fmtClock, fmtDateTime, fmtDur, plural } from '../format';
	import { S, activeSeconds, clock, doneSeconds, setShifts, username } from '../store.svelte';

	let range = $state(7), busy = $state(false);
	const mine = $derived(S.activeShifts.find(a => a.name === username()));
	const avatarOf = (name: string) => S.staff.find(m => m.name === name)?.avatar || '';

	const act = async (action: 'start' | 'break' | 'end') => {
		busy = true;
		try { setShifts(await api('/api/shifts/' + action, {})); } catch (err) { toast((err as Error).message); }
		busy = false;
	};

	const board = $derived.by(() => {
		const since = clock.now - range * DAY_MS, map = new Map<string, { user: string; avatar: string; secs: number; shifts: number }>();
		const get = (u: string, av: string) => { if (!map.has(u)) map.set(u, { user: u, avatar: av, secs: 0, shifts: 0 }); return map.get(u)!; };
		S.shifts.filter(x => x.ended >= since).forEach(x => { const e = get(x.user, x.avatar); e.secs += doneSeconds(x); if (!x.revoked && !x.manual) e.shifts++; });
		S.activeShifts.forEach(a => { const e = get(a.name, a.avatar); e.secs += activeSeconds(a); e.shifts++; });
		const rows = [...map.values()].sort((a, b) => b.secs - a.secs || b.shifts - a.shifts || a.user.localeCompare(b.user));
		const max = Math.max(1, ...rows.map(r => r.secs));
		return rows.map(r => ({ ...r, pct: (r.secs / max * 100).toFixed(1), logs: S.moderations.filter(m => m.mod === r.user && m.at >= since).length }));
	});
	const recent = $derived(S.shifts.filter(x => x.user === username()).slice(0, 10));
</script>

<PageHead title="Shifts" sub="Clock in while you moderate. Time on break doesn't count." />
<div id="view" class="enter">
	<div class="shifts-grid">
		<Box title="Your shift" icon="stopwatch">
			<div class="shift-box">
				{#if !mine}
					<div class="shift-status"><i class="sdot"></i>Off shift</div>
					<button class="btn-green" type="button" disabled={busy} onclick={() => act('start')}><Icon name="play" />Start shift</button>
				{:else}
					<div class="shift-status"><i class="sdot {mine.onBreak ? 'brk' : 'on'}"></i>{mine.onBreak ? 'On break' : 'On shift'}</div>
					<div class="shift-time">{fmtClock(activeSeconds(mine))}</div>
					<div class="shift-actions">
						{#if mine.onBreak}
							<button class="btn-green" type="button" disabled={busy} onclick={() => act('break')}><Icon name="play" />End break</button>
						{:else}
							<button class="btn-ghost btn-sm" type="button" disabled={busy} onclick={() => act('break')}><Icon name="coffee" />Start break</button>
						{/if}
						<button class="btn-danger" type="button" disabled={busy} onclick={() => act('end')}><Icon name="stop" />End shift</button>
					</div>
				{/if}
			</div>
		</Box>
		<Box title="On shift now" icon="shifts">
			<div class="panel-body">
				{#if S.activeShifts.length}
					<div style="padding:8px">
						{#each S.activeShifts as a (a.name)}
							<div class="now-row"><Avatar name={a.name} url={a.avatar} cls="lg" /><span class="nm">{a.name}{#if a.onBreak}<span class="tag">on break</span>{/if}</span><span class="tmr">{fmtClock(activeSeconds(a))}</span></div>
						{/each}
					</div>
				{:else}<Empty icon="shifts" text="Nobody is on shift" h={120} />{/if}
			</div>
		</Box>
		<Box title="Leaderboard" icon="trophy">
			{#snippet extra()}
				<div class="seg">{#each [7, 30] as r}<button class:active={range === r} onclick={() => (range = r)}>{r} days</button>{/each}</div>
			{/snippet}
			<div class="lb">
				{#each board as r, i (r.user)}
					<div class="lb-row" class:me={r.user === username()}>
						<span class="lb-rank">{#if i === 0}<Icon name="crown" />{:else}{i + 1}{/if}</span>
						<Avatar name={r.user} url={r.avatar || avatarOf(r.user)} cls="lg" />
						<div class="lb-main"><b>{r.user}</b><div class="lb-bar"><i style:width="max({r.pct}%,12px)"></i></div>
							<div class="lb-meta">{plural(r.shifts, 'shift', 'shifts')} &middot; {plural(r.logs, 'log', 'logs')}</div></div>
						<span class="lb-time">{fmtDur(r.secs)}</span>
					</div>
				{:else}<Empty icon="trophy" text="No shifts in this period" h={200} />{/each}
			</div>
		</Box>
	</div>
	<section class="panel" style="margin-top:16px">
		<div class="panel-head"><span class="t"><Icon name="history" />Your recent shifts</span></div>
		<div id="shRecent">
			<table class="players"><thead><tr><th>Started</th><th>Ended</th><th>Time</th><th class="r">Logs</th></tr></thead><tbody>
				{#each recent as x (x.id)}
					<tr>
						<td style="white-space:nowrap">{#if x.revoked}<span class="struck">{fmtDateTime(x.started)}</span><span class="revoked">Revoked</span>{:else}{fmtDateTime(x.started)}{/if}</td>
						<td style="white-space:nowrap">{fmtDateTime(x.ended)}</td>
						<td class="mono-m">{fmtDur(doneSeconds(x))}</td>
						<td class="r">{x.logs}</td>
					</tr>
				{:else}
					<tr><td colspan="4"><div class="no-results">No shifts yet</div></td></tr>
				{/each}
			</tbody></table>
		</div>
	</section>
</div>
