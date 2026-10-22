<script lang="ts">
	// Staff profile drawer: history, shifts, and shift edits for people the viewer can manage.
	import Avatar from '../Avatar.svelte';
	import Empty from '../Empty.svelte';
	import Icon from '../Icon.svelte';
	import RoleBadges from '../RoleBadges.svelte';
	import Strikes from '../Strikes.svelte';
	import EditRoles from './EditRoles.svelte';
	import { onBackdrop, portal, trap } from '../actions';
	import { api } from '../api';
	import { ask, toast } from '../dialogs.svelte';
	import { DAY_MS, fmtDateTime, fmtDur } from '../format';
	import type { IconName } from '../icons';
	import { S, activeSeconds, clock, doneSeconds, isOnShift, loadState } from '../store.svelte';
	import type { ProfileShift, StaffMember } from '../types';

	let { member, onclose }: { member: StaffMember; onclose: () => void } = $props();

	interface Profile { shifts: ProfileShift[]; history: { text: string; by: string; at: number }[]; logs7d: number; canEdit: boolean }
	const uid = $props.id();
	// the staff list refreshes in the background; follow this person's latest row
	const m = $derived(S.staff.find(x => x.id === member.id) ?? member);
	let tab = $state<'history' | 'shifts'>('history');
	let data = $state<Profile | null>(null), error = $state('');
	let editingRoles = $state(false);

	const secsOf = (sh: ProfileShift) => sh.ended == null ? activeSeconds(sh) : doneSeconds(sh);
	const week = $derived(data ? data.shifts.filter(x => x.ended == null || x.ended >= clock.now - 7 * DAY_MS).reduce((t, x) => t + secsOf(x), 0) : 0);

	const load = async () => {
		try { data = await api('/api/staff/' + encodeURIComponent(member.id)); }
		catch (err) { error = (err as Error).message; }
	};
	load();

	const change = async (path: string, body: object) => {
		try { await api(`/api/staff/${encodeURIComponent(m.id)}/${path}`, body); } catch (err) { toast((err as Error).message); }
		await Promise.all([load(), loadState().catch(() => {})]);
	};
	const addTime = async () => {
		const v = await ask({ title: 'Add or remove time', text: 'Minutes to add. Use a minus sign to remove (for example -30).', input: '', ok: 'Save' });
		if (v?.trim()) change('time', { minutes: v.trim() });
	};
	const setLength = async (sh: ProfileShift) => {
		const v = await ask({ title: 'Edit shift length', text: 'Shift length in minutes.', input: String(Math.round(doneSeconds(sh) / 60)), ok: 'Save' });
		if (v?.trim()) change('shifts/' + sh.id, { action: 'set', minutes: v.trim() });
	};

	const tabs = $derived(data ? [
		{ id: 'history', icon: 'history', label: 'History', n: data.history.length },
		{ id: 'shifts', icon: 'shifts', label: 'Shifts', n: data.shifts.length }
	] as const : []);
</script>

{#snippet act(label: string, icon: IconName, run: () => void)}
	<button class="dots-btn" type="button" aria-label={label} title={label} onclick={run}><Icon name={icon} /></button>
{/snippet}

<div class="drawer-back" use:portal use:trap={onclose} onmousedown={onBackdrop(onclose)} role="presentation">
	<div class="drawer" role="dialog" aria-modal="true" aria-labelledby="{uid}-n">
		<div class="pf-head">
			<Avatar name={m.name} url={m.avatar} cls="xl" />
			<div class="pf-who">
				<h2 id="{uid}-n">{m.name}</h2>
				<p>@{m.handle || ''} · {m.rank}{S.serverName ? ' in ' + S.serverName : ''}</p>
				<div class="pf-tags">
					<RoleBadges {m} />
					{#if isOnShift(m.name)}<span class="onshift">On shift</span>{:else}<span class="pf-off">Off shift</span>{/if}
					{#if m.assignable.length}<button class="btn-ghost btn-sm" type="button" onclick={() => (editingRoles = true)}><Icon name="roles" />Edit roles</button>{/if}
				</div>
			</div>
			<button class="x" type="button" aria-label="Close" onclick={onclose} data-autofocus><Icon name="close" /></button>
		</div>
		<div class="pf-stats">
			<div><b>{data ? fmtDur(week) : '–'}</b><span>This week</span></div>
			<div><b>{data ? data.logs7d : '–'}</b><span>Logs (7d)</span></div>
			<div><b><Strikes n={m.strikes} /></b><span>Strikes</span></div>
			<div><b>{new Date(m.since).toLocaleDateString('en-US')}</b><span>Staff since</span></div>
		</div>
		<div class="pf-body">
			<div class="seg" role="tablist">
				{#each tabs as t (t.id)}
					<button role="tab" aria-selected={tab === t.id} class:active={tab === t.id} onclick={() => (tab = t.id)}><Icon name={t.icon} />{t.label} <span class="n">{t.n}</span></button>
				{/each}
			</div>
			<div>
				{#if !data}
					<Empty icon={error ? 'alert' : 'loading'} text={error || 'Loading…'} />
				{:else if tab === 'history'}
					{#each data.history as h}
						<div class="pf-row"><i class="pf-dot"></i><div class="pf-main"><b>{h.text}</b><small>by {h.by} · {fmtDateTime(h.at)}</small></div></div>
					{:else}
						<Empty icon="moderations" text="Nothing on their record" />
					{/each}
				{:else}
					{#if data.canEdit}<div class="pf-tools"><button class="btn-ghost btn-sm" type="button" onclick={addTime}><Icon name="shifts" />Add or remove time</button></div>{/if}
					{#each data.shifts as sh (sh.id)}
						{@const live = sh.ended == null}
						{@const title = sh.manual ? (sh.adjustMs >= 0 ? 'Time added' : 'Time removed') : fmtDateTime(sh.started)}
						<div class="pf-row" class:is-revoked={sh.revoked} class:is-live={!sh.revoked && live}><i class="pf-dot"></i>
							<div class="pf-main">
								<b>{#if sh.revoked}<span class="struck">{title}</span><span class="revoked">Revoked</span>{:else}{title}{/if}</b>
								<small>{live ? (sh.onBreak ? 'On break' : 'On shift now') : sh.manual ? fmtDateTime(sh.ended!) : 'Ended ' + fmtDateTime(sh.ended!)}</small>
								{#if sh.revoked && sh.revokedBy}<small>{sh.revokedBy}</small>{/if}
							</div>
							<span class="pf-dur">{sh.manual && !sh.revoked ? (sh.adjustMs < 0 ? '-' : '+') + fmtDur(Math.abs(sh.adjustMs) / 1000) : fmtDur(secsOf(sh))}</span>
							<span class="pf-acts">
								{#if data.canEdit && !live}
									{#if sh.revoked}
										{@render act('Restore shift', 'refresh', () => change('shifts/' + sh.id, { action: 'restore' }))}
									{:else}
										{#if !sh.manual}{@render act('Edit length', 'pencil', () => setLength(sh))}{/if}
										{@render act('Revoke shift', 'bans', () => change('shifts/' + sh.id, { action: 'revoke' }))}
									{/if}
								{/if}
							</span>
						</div>
					{:else}
						<Empty icon="shifts" text="No shifts yet" />
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

{#if editingRoles}<EditRoles {m} onclose={() => { editingRoles = false; load(); }} />{/if}
