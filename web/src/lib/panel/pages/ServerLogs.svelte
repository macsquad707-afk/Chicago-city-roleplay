<script lang="ts">
	import { onDestroy } from 'svelte';
	import Empty from '../Empty.svelte';
	import Icon from '../Icon.svelte';
	import LogRow from '../LogRow.svelte';
	import PageHead from '../PageHead.svelte';
	import { api } from '../api';
	import { LOGS_POLL_MS } from '../config';
	import { ask, toast } from '../dialogs.svelte';
	import { DAY_MS } from '../format';
	import { S, can, clock } from '../store.svelte';
	import type { LogEntry } from '../types';

	const FILTERS = [
		{ id: 'all', label: 'Everything', dot: '' },
		{ id: 'join', label: 'Joins', dot: '#3ddc97' },
		{ id: 'leave', label: 'Leaves', dot: '#8b8f98' },
		{ id: 'kill', label: 'Kills', dot: '#ef4444' },
		{ id: 'command', label: 'Commands', dot: '#d4d4d4' },
		{ id: 'modcall', label: 'Mod calls', dot: '#f5a623' }
	];
	let filter = $state('all'), query = $state(''), shown = $state(100), clearing = $state(false);

	const rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return S.logs.filter(l =>
			clock.now - l.at <= (l.type === 'command' ? S.commandRetentionDays : S.logRetentionDays) * DAY_MS &&
			(filter === 'all' || l.type === filter) &&
			(!q || [l.user, l.cmd, l.target, l.text].join(' ').toLowerCase().includes(q)));
	});

	const clear = async () => {
		if (!await ask({ title: 'Clear all server logs?', text: "This deletes every saved server log for everyone and can't be undone. Command history on the Commands page stays.", ok: 'Clear logs', danger: true })) return;
		clearing = true;
		try { await api('/api/logs/clear', {}); S.logs = []; } catch (err) { toast((err as Error).message); }
		clearing = false;
	};

	const poll = async () => {
		try {
			const data = await api<LogEntry[]>('/api/logs');
			S.logs = (Array.isArray(data) ? data : []).sort((a, b) => b.at - a.at);
		} catch { /* keep showing what we have */ }
	};
	poll();
	const timer = setInterval(poll, LOGS_POLL_MS);
	onDestroy(() => clearInterval(timer));
</script>

<PageHead title="Server logs" sub="Joins, leaves, kills, commands and mod calls from your ER:LC server. You can look back {S.logRetentionDays} days, or {S.commandRetentionDays} for commands.">
	{#snippet tools()}
		<div class="tools-row">
			<label class="search"><Icon name="search" /><input type="search" placeholder="Search a player or command" autocomplete="off" aria-label="Search logs" bind:value={query} oninput={() => (shown = 100)} /></label>
			{#if can('logs.clear')}<button class="btn-danger" type="button" disabled={clearing} onclick={clear}><Icon name="trash" />Clear logs</button>{/if}
		</div>
	{/snippet}
</PageHead>
<div id="view" class="enter">
	<div class="pills">
		{#each FILTERS as f (f.id)}
			<button class="pill" class:active={f.id === filter} style:--dot={f.dot || undefined} onclick={() => { filter = f.id; shown = 100; }}>{#if f.dot}<span class="dot"></span>{/if}{f.label}</button>
		{/each}
	</div>
	<section class="panel logs">
		<div class="feed">
			{#each rows.slice(0, shown) as l}<LogRow {l} mono />{:else}<Empty icon="pulse" text={S.logs.length ? 'No logs match' : 'No logs yet'} />{/each}
		</div>
		{#if rows.length > shown}
			<div class="log-more"><button class="btn-ghost" type="button" onclick={() => (shown += 100)}><Icon name="chevrondown" />Load more</button></div>
		{/if}
	</section>
</div>
