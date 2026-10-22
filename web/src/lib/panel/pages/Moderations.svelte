<script lang="ts">
	import Avatar from '../Avatar.svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import LogDetail from '../dialogs/LogDetail.svelte';
	import LogModal from '../dialogs/LogModal.svelte';
	import { MOD_TYPES, typeById } from '../config';
	import { isUrl } from '../format';
	import { S, ago, username } from '../store.svelte';
	import type { Moderation } from '../types';

	let filter = $state('all'), onlyMine = $state(false), query = $state('');
	let logging = $state(false), open = $state<Moderation | null>(null);

	const rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return S.moderations.filter(m =>
			(filter === 'all' || m.type === filter) &&
			(!onlyMine || m.mod === username()) &&
			(!q || m.user.toLowerCase().includes(q) || m.reason.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)));
	});
	const openRow = (m: Moderation) => (open = m);
</script>

<PageHead title="Moderations" sub="Warnings, kicks, bans, ban BOLOs and notes your staff have logged.">
	{#snippet tools()}
		<button class="btn-primary" type="button" onclick={() => (logging = true)}><Icon name="plus" />New log</button>
	{/snippet}
</PageHead>
<div id="view" class="enter">
	<div class="filter-row">
		<div class="pills" style="margin:0">
			<button class="pill" class:active={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
			{#each MOD_TYPES as t (t.id)}
				<button class="pill" class:active={filter === t.id} style:--c={t.color} onclick={() => (filter = t.id)}><span class="dot"></span>{t.label}</button>
			{/each}
		</div>
		<label class="only-mine"><span class="switch"><input type="checkbox" bind:checked={onlyMine} /><i></i></span>Only mine</label>
		<span class="spacer"></span>
		<label class="search"><Icon name="search" /><input type="search" placeholder="Player, reason or MOD-…" autocomplete="off" aria-label="Search moderations" bind:value={query} /></label>
	</div>
	{#if !S.moderations.length}
		<div class="empty-card"><Icon name="moderations" /><b>No moderations yet</b><p>Log a warning, kick or ban and it shows here for the whole staff team.</p></div>
	{:else if !rows.length}
		<div class="empty-card"><Icon name="moderations" /><b>No matching moderations</b><p>Try a different filter or search.</p></div>
	{:else}
		<div class="table-wrap"><table class="players">
			<thead><tr><th>Log</th><th>Player</th><th>Reason</th><th>Moderator</th><th>Status</th><th class="r">When</th></tr></thead>
			<tbody>
				{#each rows as m (m.id)}
					{@const t = typeById(m.type)}
					<tr class="click-row" tabindex="0" aria-label="Open log {m.id}"
						onclick={e => { if (!(e.target as Element).closest('a')) openRow(m); }}
						onkeydown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openRow(m); } }}>
						<td style="white-space:nowrap"><span class="logbadge" style:--c={t.color}><Icon name={t.icon} />{t.label}</span><span class="logid">{m.id}</span>{#if m.duration}<span class="logdur">{m.duration}</span>{/if}</td>
						<td><span class="pname">{m.user}</span></td>
						<td><div class="reason"><span title={m.reason}>{m.reason}</span>{#if isUrl(m.evidence)}<a href={m.evidence} target="_blank" rel="noopener noreferrer">Evidence</a>{/if}</div></td>
						<td><span class="mod"><Avatar name={m.mod} url={m.modAvatar} />{m.mod}</span></td>
						<td><span class="status">{m.status || 'Logged'}</span></td>
						<td class="r" style="white-space:nowrap;color:var(--label)">{ago(m.at)}</td>
					</tr>
				{/each}
			</tbody>
		</table></div>
	{/if}
</div>

{#if logging}<LogModal onclose={() => (logging = false)} />{/if}
{#if open}<LogDetail m={open} onclose={() => (open = null)} />{/if}
