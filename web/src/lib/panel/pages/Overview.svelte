<script lang="ts">
	import Avatar from '../Avatar.svelte';
	import Box from '../Box.svelte';
	import Empty from '../Empty.svelte';
	import Icon from '../Icon.svelte';
	import LogRow from '../LogRow.svelte';
	import PageHead from '../PageHead.svelte';
	import RobloxAvatar from '../RobloxAvatar.svelte';
	import { typeById } from '../config';
	import { greeting } from '../format';
	import type { IconName } from '../icons';
	import { S, ago, username } from '../store.svelte';

	const stats = $derived.by(() => {
		const o = S.overview;
		const s = (label: string, icon: IconName, tint: string, value: string | number = '–', note = '', hot = false) => ({ label, icon, tint, value: String(value), note, hot });
		if (!o) return [
			s('Players', 'players', '#9aa4b1'), s('In queue', 'hourglass', '#22b8cf'), s('Staff in game', 'shield', '#3ddc97'),
			s('Mod calls', 'phone', '#f5a623', '–', 'waiting for a moderator'), s('Logs today', 'moderations', '#ef4444'), s('Ban BOLOs', 'eye', '#a855f7')
		];
		const st = o.staff, calls = o.modCalls.length;
		return [
			s('Players', 'players', '#9aa4b1', o.erlcOk ? `${o.players}/${o.maxPlayers}` : '–', o.erlcOk ? `${o.onTeam} on a team` : o.error),
			s('In queue', 'hourglass', '#22b8cf', o.queue),
			s('Staff in game', 'shield', '#3ddc97', st.total, `${st.admin} admin · ${st.mod} mod · ${st.helper} helper`),
			// only a stat that needs action gets its color
			s('Mod calls', 'phone', '#f5a623', calls, calls ? 'waiting for a moderator' : '', calls > 0),
			s('Logs today', 'moderations', '#ef4444', o.logsToday),
			s('Ban BOLOs', 'eye', '#a855f7', o.bolos)
		];
	});
	const calls = $derived(S.overview?.modCalls ?? []);
</script>

<PageHead title="{greeting()}, {username()}" sub={S.serverName} />
<div id="view" class="enter">
	<div class="stats">
		{#each stats as s}
			<div class="stat" class:hot={s.hot} style:--tint={s.tint}>
				<div class="stat-top"><span>{s.label}</span><span class="stat-icon"><Icon name={s.icon} /></span></div>
				<div class="stat-value">{s.value}</div>
				<div class="stat-note">{s.note}</div>
			</div>
		{/each}
	</div>
	<div class="grid">
		<Box title="Live activity" icon="pulse" link={{ href: '#serverlogs', text: 'View all' }} cls="tall">
			<div class="panel-body">
				{#if S.logs.length}<div class="feed">{#each S.logs.slice(0, 8) as l}<LogRow {l} />{/each}</div>
				{:else}<Empty icon="pulse" text="No activity yet" />{/if}
			</div>
		</Box>
		<Box title="On shift" icon="shifts" link={{ href: '#shifts', text: 'View all' }} cls="tall">
			<div class="panel-body">
				{#if S.activeShifts.length}
					<div class="feed">{#each S.activeShifts as m}<div class="row"><Avatar name={m.name} url={m.avatar} /><span class="row-text"><b>{m.name}</b>{m.onBreak ? ' (on break)' : ''}</span><span class="row-time">{ago(m.started)}</span></div>{/each}</div>
				{:else}<Empty icon="shifts" text="Nobody is on shift" />{/if}
			</div>
		</Box>
	</div>
	<div class="grid">
		<Box title="Recent moderations" icon="moderations" link={{ href: '#moderations', text: 'View all' }} cls="short">
			<div class="panel-body">
				{#if S.moderations.length}
					<div class="feed">{#each S.moderations.slice(0, 5) as m (m.id)}<div class="row"><span class="row-text"><b>{m.mod}</b> {typeById(m.type).verb} <b>{m.user}</b></span><span class="row-time">{ago(m.at)}</span></div>{/each}</div>
				{:else}<Empty icon="moderations" text="No moderations logged yet" />{/if}
			</div>
		</Box>
		<Box title="Mod calls" icon="phone" cls="short">
			<div class="panel-body">
				{#if calls.length}
					<div class="feed">{#each calls as c}<div class="row call"><RobloxAvatar name={c.user} id={c.id} /><span class="row-text"><b>{c.user}</b><small>Needs a moderator</small></span><span class="call-wait"><Icon name="phone" />{ago(c.at)}</span></div>{/each}</div>
				{:else}<Empty icon="phone" text="No mod calls" />{/if}
			</div>
		</Box>
	</div>
</div>
