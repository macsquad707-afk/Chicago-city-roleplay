<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import { api } from '../api';
	import { MOD_TYPES, PERM_GROUPS, PERM_LABELS } from '../config';
	import { ask } from '../dialogs.svelte';
	import { applyConfig } from '../store.svelte';
	import type { RoleFull, Settings } from '../types';

	const SECTIONS = [['setAccess', 'Access'], ['setMods', 'Moderation logs'], ['setErlc', 'ER:LC'], ['setRecords', 'Records']];
	const NUMBERS = ['maxStrikes', 'maxOnShift', 'logRetentionDays', 'commandRetentionDays'] as const;
	type Draft = { rolePerms: Record<string, string[]>; blockedCommands: string[]; autoErlc: boolean } & Record<(typeof NUMBERS)[number], number>;

	let saved = $state<Settings | null>(null), loadError = $state('');
	let draft = $state<Draft | null>(null);
	let status = $state<{ text: string; kind: 'ok' | 'bad' } | null>(null);
	let saving = $state(false);
	let blkInput = $state(''), blkErr = $state('');
	let blkField = $state<HTMLInputElement>();

	const fromSaved = (s: Settings): Draft => ({
		rolePerms: Object.fromEntries(s.roles.map(r => [String(r.id), [...r.perms]])),
		blockedCommands: [...s.blockedCommands], autoErlc: s.autoErlc,
		maxStrikes: s.maxStrikes, maxOnShift: s.maxOnShift, logRetentionDays: s.logRetentionDays, commandRetentionDays: s.commandRetentionDays
	});
	// order-independent snapshot, so "dirty" means a value really changed
	const canon = (d: Draft) => JSON.stringify({ ...d, rolePerms: Object.entries(d.rolePerms).map(([k, v]) => [k, [...v].sort()]).sort() });
	const dirty = $derived(!!saved && !!draft && canon(draft) !== canon(fromSaved(saved)));

	const groups = $derived.by(() => {
		if (!saved) return [];
		const known = new Set(PERM_GROUPS.flatMap(g => g[1]));
		const perms = saved.perms;
		return [...PERM_GROUPS, ['Other', perms.filter(k => !known.has(k) && !k.startsWith('log.'))] as [string, string[]]]
			.map(([g, keys]) => [g, keys.filter(k => perms.includes(k))] as const).filter(([, keys]) => keys.length);
	});

	const edited = () => { status = null; };
	const toggle = (r: RoleFull, perm: string, on: boolean) => {
		const list = (draft!.rolePerms[r.id] ||= []);
		draft!.rolePerms[r.id] = on ? [...list, perm] : list.filter(p => p !== perm);
		edited();
	};
	const step = (k: (typeof NUMBERS)[number], by: number, min: number, max: number) => {
		draft![k] = Math.min(max, Math.max(min, (+draft![k] || 0) + by));
		edited();
	};
	const addBlocked = () => {
		let v = blkInput.trim().toLowerCase(); if (!v) return;
		if (!v.startsWith(':')) v = ':' + v;
		if (!/^:[a-z0-9_]{1,30}$/.test(v)) { blkErr = 'Use a single command word, like :kill'; return; }
		blkErr = '';
		if (!draft!.blockedCommands.includes(v)) draft!.blockedCommands.push(v);
		blkInput = '';
		edited();
		blkField?.focus();
	};
	const unblock = (i: number) => { draft!.blockedCommands.splice(i, 1); edited(); blkField?.focus(); };
	const jump = (e: MouseEvent, id: string) => {
		e.preventDefault();
		document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
	};

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (!saved || !draft) return;
		const next = $state.snapshot(draft);
		const cut = ([['logRetentionDays', 'server logs'], ['commandRetentionDays', 'command logs']] as const).filter(([k]) => next[k] < saved![k]);
		if (cut.length && !await ask({ title: 'Delete older logs?', text: cut.map(([k, l]) => `Delete ${l} older than ${next[k]} days.`).join(' ') + " This can't be undone.", ok: 'Save and delete', danger: true })) return;
		saving = true;
		try {
			saved = await api<Settings>('/api/settings', next);
			applyConfig(saved);
			draft = fromSaved(saved);
			const done = status = { text: 'Settings saved', kind: 'ok' };
			setTimeout(() => { if (status === done) status = null; }, 2500);
		} catch (err) { status = { text: (err as Error).message, kind: 'bad' }; }
		saving = false;
	}

	api<Settings>('/api/settings').then(s => { saved = s; draft = fromSaved(s); }).catch(err => { loadError = err.message; });
</script>

<svelte:window onbeforeunload={e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }} />

{#snippet grid(roles: RoleFull[], body: Snippet)}
	{#if roles.length}
		<div class="lad multi" style:--cols={roles.length}>
			<div class="lad-row lad-head" aria-hidden="true"><span></span>{#each roles as r (r.id)}<span class="lad-rank" style:--c={r.color} title={r.name}><i></i>{r.name}</span>{/each}</div>
			{@render body()}
		</div>
	{:else}
		<div class="set-card"><p class="set-none">No roles yet. Create them on the <a href="#roles">Roles</a> page.</p></div>
	{/if}
{/snippet}

<!-- one row of the role grid: a checkbox per role for this permission -->
{#snippet ladderRow(perm: string, label: string, lead?: Snippet)}
	{@const id = 'lad-' + perm.replace(/[^a-z0-9]/gi, '-')}
	<div class="lad-row" role="group" aria-labelledby={id}>
		<span class="lad-label" {id}>{@render lead?.()}{label}</span>
		{#each saved!.roles as r (r.id)}
			<label class="lad-cell" style:--c={r.color}>
				<input type="checkbox" checked={draft!.rolePerms[r.id]?.includes(perm)} aria-label={r.name} onchange={e => toggle(r, perm, e.currentTarget.checked)} />
				<span class="lad-pip"><Icon name="check" /></span></label>
		{/each}
	</div>
{/snippet}

{#snippet stepper(k: (typeof NUMBERS)[number], label: string, min: number, max: number, unit: string)}
	<div class="stepper">
		<button type="button" aria-label="Decrease {label}" onclick={() => step(k, -1, min, max)}><Icon name="minus" /></button>
		<input type="number" inputmode="numeric" {min} {max} autocomplete="off" aria-label="{label} ({unit})" bind:value={draft![k]} oninput={edited} />
		<span class="unit" aria-hidden="true">{unit}</span>
		<button type="button" aria-label="Increase {label}" onclick={() => step(k, 1, min, max)}><Icon name="plus" /></button>
	</div>
{/snippet}

<PageHead title="Settings" sub="Only owners see this page. Changes apply to everyone right away." />
<div id="view" class="enter">
	<div class="set-wrap" aria-busy={!saved}>
		{#if loadError}
			<div class="placeholder">Couldn't load settings: {loadError}</div>
		{:else if !saved || !draft}
			<div class="set-skel"><i></i><i></i><i></i></div>
		{:else}
			{@const s = saved}
			<nav class="set-rail" aria-label="Settings sections">{#each SECTIONS as [id, l]}<a href="#{id}" onclick={e => jump(e, id)}>{l}</a>{/each}</nav>
			<form class="set-main" novalidate onsubmit={save}>
				<section class="set-sec" id="setAccess" aria-labelledby="setAccessH">
					<h2 id="setAccessH">Access</h2>
					<p>Tick what each role can do. People get everything their roles allow. The owners listed in backend.py can always do everything.</p>
					{#snippet access()}
						{#each groups as [g, keys]}
							<div class="lad-group">{g}</div>
							{#each keys as k}{@render ladderRow(k, PERM_LABELS[k] || k)}{/each}
						{/each}
					{/snippet}
					{@render grid(s.roles, access)}
				</section>
				<section class="set-sec" id="setMods" aria-labelledby="setModsH">
					<h2 id="setModsH">Moderation logs</h2>
					<p>Tick which roles can log each type.</p>
					{#snippet mods()}
						{#each MOD_TYPES.filter(t => s.perms.includes('log.' + t.id)) as t (t.id)}
							{#snippet lead()}<span class="lad-ico" style:color={t.color}><Icon name={t.icon} /></span>{/snippet}
							{@render ladderRow('log.' + t.id, t.label, lead)}
						{/each}
					{/snippet}
					{@render grid(s.roles, mods)}
				</section>
				<section class="set-sec" id="setErlc" aria-labelledby="setErlcH">
					<h2 id="setErlcH">ER:LC</h2>
					<div class="set-card">
						<label class="set-line">
							<span class="set-text"><b>Send moderations to the game</b><small>Logged kicks and bans also happen in game.</small></span>
							<span class="switch"><input type="checkbox" bind:checked={draft.autoErlc} onchange={edited} /><i></i></span>
						</label>
						<div class="set-line col">
							<span class="set-text"><b id="blkH">Blocked commands</b><small>The panel refuses these for everyone.</small></span>
							<div class="chips" aria-labelledby="blkH">
								{#each draft.blockedCommands as c, i (c)}
									<span class="chip"><span translate="no">{c}</span><button type="button" aria-label="Remove {c}" onclick={() => unblock(i)}><Icon name="close" /></button></span>
								{:else}
									<span class="chip-empty">Nothing blocked. Staff can run any command from the panel.</span>
								{/each}
							</div>
							<div class="chip-add">
								<input type="text" placeholder=":kill" autocomplete="off" spellcheck="false" aria-label="Command to block" bind:value={blkInput} bind:this={blkField}
									onkeydown={e => { if (e.key === 'Enter') { e.preventDefault(); addBlocked(); } }} />
								<button class="btn-ghost btn-sm" type="button" onclick={addBlocked}><Icon name="plus" />Block command</button>
							</div>
							<small class="set-err" role="alert">{blkErr}</small>
						</div>
					</div>
				</section>
				<section class="set-sec" id="setRecords" aria-labelledby="setRecordsH">
					<h2 id="setRecordsH">Records</h2>
					<div class="set-card">
						<div class="set-line"><span class="set-text"><b>Max strikes</b><small>Strikes stop counting here.</small></span>{@render stepper('maxStrikes', 'Max strikes', 1, 10, 'strikes')}</div>
						<div class="set-line"><span class="set-text"><b>Max on shift at once</b><small>0 means no limit.</small></span>{@render stepper('maxOnShift', 'Shift limit', 0, 100, 'people')}</div>
						<div class="set-line"><span class="set-text"><b>Keep server logs</b><small>Older logs are deleted.</small></span>{@render stepper('logRetentionDays', 'Keep server logs', 1, 365, 'days')}</div>
						<div class="set-line"><span class="set-text"><b>Keep command logs</b><small>Older commands are deleted.</small></span>{@render stepper('commandRetentionDays', 'Keep command logs', 1, 365, 'days')}</div>
					</div>
				</section>
				{#if dirty || status?.kind === 'ok'}
					<div class="savebar">
						<span id="setMsg" class={status?.kind ?? ''} role="status" aria-live="polite">{status?.text ?? 'You have unsaved changes'}</span>
						{#if dirty}<button class="btn-ghost btn-sm" type="button" onclick={() => { draft = fromSaved(s); status = null; }}><Icon name="undo" />Discard</button>{/if}
						<button class="btn-primary" type="submit" disabled={!dirty || saving}><Icon name={saving ? 'loading' : 'save'} />{saving ? 'Saving…' : 'Save changes'}</button>
					</div>
				{/if}
			</form>
		{/if}
	</div>
</div>
