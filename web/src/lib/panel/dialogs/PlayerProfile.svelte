<script lang="ts">
	// Player overview drawer (Players page). Shows the player as they were when it was opened.
	import Empty from '../Empty.svelte';
	import Icon from '../Icon.svelte';
	import LogRow from '../LogRow.svelte';
	import RobloxAvatar from '../RobloxAvatar.svelte';
	import LogModal from './LogModal.svelte';
	import { onBackdrop, portal, trap } from '../actions';
	import { PERM_COLORS, teamColor, typeById } from '../config';
	import { isRobloxId, isUrl } from '../format';
	import { S, ago, can } from '../store.svelte';
	import type { Player } from '../types';

	let { p, onclose }: { p: Player; onclose: () => void } = $props();

	const uid = $props.id();
	let tab = $state<'record' | 'activity'>('record');
	let logging = $state(false);
	const record = $derived(S.moderations.filter(m => m.user.toLowerCase() === p.name.toLowerCase()));
	const activity = $derived(S.logs.filter(l => l.user === p.name || l.target === p.name).slice(0, 100));
	const joined = $derived(S.logs.find(l => l.type === 'join' && l.user === p.name));
	const tabs = $derived([
		{ id: 'record', icon: 'moderations', label: 'Record', n: record.length },
		{ id: 'activity', icon: 'serverlogs', label: 'Activity', n: activity.length }
	] as const);
</script>

<div class="drawer-back" use:portal use:trap={onclose} onmousedown={onBackdrop(onclose)} role="presentation">
	<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="{uid}-n">
		<div class="pf-head">
			<RobloxAvatar name={p.name} id={p.id} cls="xl" />
			<div class="pf-who">
				<h2 id="{uid}-n">{p.name}</h2>
				<p>{p.location || 'Location unknown'}</p>
				<div class="pf-tags"><span class="team" style:--dot={teamColor(p.team)}><i></i>{p.team}</span>
					{#if PERM_COLORS[p.permission]}<span class="badge" style:--c={PERM_COLORS[p.permission]}>{p.permission}</span>{/if}</div>
			</div>
			<button class="x" type="button" aria-label="Close" onclick={onclose} data-autofocus><Icon name="close" /></button>
		</div>
		<div class="pf-stats">
			<div><b>{p.callsign || '–'}</b><span>Callsign</span></div>
			<div><b>{record.length}</b><span>Logs</span></div>
			<div><b>{joined ? ago(joined.at) : '–'}</b><span>Joined</span></div>
			<div><b>{#if p.id}<span class="mono">{p.id}</span>{:else}&ndash;{/if}</b><span>User ID</span></div>
		</div>
		<div class="pp-actions">
			{#if can('moderations.view')}<button class="btn-primary" type="button" onclick={() => (logging = true)}><Icon name="plus" />New log</button>{/if}
			{#if isRobloxId(p.id)}<a class="btn-ghost btn-sm" href="https://www.roblox.com/users/{p.id}/profile" target="_blank" rel="noopener noreferrer">Roblox profile</a>{/if}
		</div>
		<div class="pf-body">
			<div class="seg" role="tablist">
				{#each tabs as t (t.id)}
					<button role="tab" aria-selected={tab === t.id} class:active={tab === t.id} onclick={() => (tab = t.id)}><Icon name={t.icon} />{t.label} <span class="n">{t.n}</span></button>
				{/each}
			</div>
			<div>
				{#if tab === 'record'}
					{#each record as m (m.id)}
						{@const t = typeById(m.type)}
						<div class="pf-row"><i class="pf-dot" style:background={t.color}></i><div class="pf-main">
							<b>{t.label}{#if m.duration}{' '}<span class="pp-dur">{m.duration}</span>{/if}</b>
							<span class="pp-reason">{m.reason}{#if isUrl(m.evidence)}{' '}<a href={m.evidence} target="_blank" rel="noopener noreferrer">Evidence</a>{/if}</span>
							<small>by {m.mod} &middot; {ago(m.at)}</small></div></div>
					{:else}
						<Empty icon="moderations" text="Nothing on their record" />
					{/each}
				{:else if activity.length}
					<div class="pp-feed">{#each activity as l}<LogRow {l} mono />{/each}</div>
				{:else}
					<Empty icon="serverlogs" text={can('logs.view') ? 'No logged activity yet' : "You can't see server logs"} />
				{/if}
			</div>
		</div>
	</div>
</div>

{#if logging}<LogModal player={p.name} onsaved={() => (tab = 'record')} onclose={() => (logging = false)} />{/if}
