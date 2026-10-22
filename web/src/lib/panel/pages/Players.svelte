<script lang="ts">
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import RobloxAvatar from '../RobloxAvatar.svelte';
	import PlayerProfile from '../dialogs/PlayerProfile.svelte';
	import { PERM_COLORS, isStaff, teamColor } from '../config';
	import { S } from '../store.svelte';
	import type { Player } from '../types';

	let filter = $state('everyone'), query = $state('');
	let open = $state<Player | null>(null);

	const filters = $derived([
		{ id: 'everyone', label: 'Everyone', dot: '', test: (_: Player) => true },
		{ id: 'staff', label: 'Staff', dot: '#e6ebf0', test: isStaff },
		...[...new Set(S.players.map(p => p.team))].map(t => ({ id: 'team:' + t, label: t, dot: teamColor(t), test: (p: Player) => p.team === t }))
	]);
	const rows = $derived.by(() => {
		const active = filters.find(f => f.id === filter) || filters[0];
		const q = query.trim().toLowerCase();
		return S.players.filter(active.test).filter(p => !q || p.name.toLowerCase().includes(q) || (p.callsign || '').toLowerCase().includes(q));
	});
	// snapshot, so the drawer doesn't change under you when the list refreshes
	const openRow = (p: Player) => (open = { ...p });
</script>

<PageHead title="Players" sub="{S.players.length} of {S.maxPlayers} in game">
	{#snippet tools()}
		<label class="search"><Icon name="search" /><input type="search" placeholder="Search name or callsign" autocomplete="off" aria-label="Search players" bind:value={query} /></label>
	{/snippet}
</PageHead>
<div id="view" class="enter">
	<div class="pills">
		{#each filters as f (f.id)}
			<button class="pill" class:active={f.id === filter} style:--dot={f.dot || undefined} onclick={() => (filter = f.id)}>
				{#if f.dot}<span class="dot"></span>{/if}{f.label} <span class="n">{S.players.filter(f.test).length}</span>
			</button>
		{/each}
	</div>
	<div class="table-wrap">
		<table class="players">
			<thead><tr><th>Player</th><th>Team</th><th>Callsign</th><th>Location</th><th>Permission</th></tr></thead>
			<tbody>
				{#each rows as p (p.name)}
					<tr class="click-row" tabindex="0" aria-label="Open {p.name}'s overview" onclick={() => openRow(p)}
						onkeydown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openRow(p); } }}>
						<td><div class="pl"><RobloxAvatar name={p.name} id={p.id} /><span class="pname">{p.name}</span></div></td>
						<td><span class="team" style:--dot={teamColor(p.team)}><i></i>{p.team}</span></td>
						<td>{p.callsign || '–'}</td>
						<td>{p.location}</td>
						<td>{#if PERM_COLORS[p.permission]}<span class="badge" style:--c={PERM_COLORS[p.permission]}>{p.permission}</span>{:else}&ndash;{/if}</td>
					</tr>
				{:else}
					<tr><td colspan="5"><div class="no-results">No players match.</div></td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if open}<PlayerProfile p={open} onclose={() => (open = null)} />{/if}
