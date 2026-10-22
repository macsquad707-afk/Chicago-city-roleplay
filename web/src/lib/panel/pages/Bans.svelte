<script lang="ts">
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import RobloxAvatar from '../RobloxAvatar.svelte';
	import LogModal from '../dialogs/LogModal.svelte';
	import { api } from '../api';
	import { normalizeBans } from '../config';
	import { ask } from '../dialogs.svelte';
	import { isRobloxId } from '../format';
	import { ago, can } from '../store.svelte';
	import type { Ban } from '../types';

	const canUnban = can('bans.remove');
	let bans = $state<Ban[]>([]), checkedAt = $state(Date.now());
	let query = $state(''), refreshing = $state(false), banning = $state(false);
	let note = $state(''); // replaces the subtitle after a failed action
	let unbanning = $state<string | null>(null);

	const rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return bans.filter(b => !q || b.name.toLowerCase().includes(q) || b.id.includes(q));
	});

	const refresh = async () => {
		refreshing = true;
		try {
			bans = normalizeBans(await api('/api/bans'));
			checkedAt = Date.now();
			note = '';
		} catch { note = "Couldn't refresh the ban list. Press Refresh to try again."; }
		refreshing = false;
	};
	refresh();

	const unban = async (b: Ban) => {
		const name = b.name || b.id;
		if (!await ask({ title: `Unban ${name}?`, text: "They'll be able to join the ER:LC server again.", ok: 'Unban', danger: true })) return;
		unbanning = b.id;
		try { await api(`/api/bans/${b.id}/unban`, {}); }
		catch (err) { note = `Couldn't unban ${name}: ${(err as Error).message}`; unbanning = null; return; }
		unbanning = null;
		note = '';
		bans = bans.filter(x => x.id !== b.id);
	};
</script>

<PageHead title="Bans" sub={note || `${bans.length} banned on the ER:LC server · checked ${ago(checkedAt)}`}>
	{#snippet tools()}
		<div class="tools-row">
			<label class="search"><Icon name="search" /><input type="search" placeholder="Name or user ID" autocomplete="off" aria-label="Search bans" bind:value={query} /></label>
			<button class="btn-ghost btn-sm" type="button" disabled={refreshing} onclick={refresh}><Icon name="refresh" />Refresh</button>
			<button class="btn-danger" type="button" onclick={() => (banning = true)}><Icon name="bans" />Ban someone</button>
		</div>
	{/snippet}
</PageHead>
<div id="view" class="enter">
	{#if !bans.length}
		<div class="empty-card"><Icon name="bans" /><b>Nobody is banned</b></div>
	{:else if !rows.length}
		<div class="empty-card"><Icon name="bans" /><b>No matching bans</b></div>
	{:else}
		<div class="table-wrap"><table class="players">
			<thead><tr><th>Player</th><th>User ID</th>{#if canUnban}<th></th>{/if}</tr></thead>
			<tbody>
				{#each rows as b}
					<tr>
						<td><div class="pl"><RobloxAvatar name={b.name} id={b.id} /><span class="pname">{b.name || 'Unknown'}</span></div></td>
						<td class="case">{b.id || '–'}</td>
						{#if canUnban}<td>{#if isRobloxId(b.id)}<button class="btn-ghost btn-sm" type="button" disabled={unbanning === b.id} onclick={() => unban(b)}><Icon name="unlock" />Unban</button>{/if}</td>{/if}
					</tr>
				{/each}
			</tbody>
		</table></div>
	{/if}
</div>

<!-- "Ban someone" opens the moderation log dialog with Ban preselected, so every ban is also logged -->
{#if banning}
	<LogModal initialType="ban" onclose={() => (banning = false)} onsaved={e => { if (e.type === 'ban') bans = [{ name: e.user, id: '' }, ...bans]; }} />
{/if}
