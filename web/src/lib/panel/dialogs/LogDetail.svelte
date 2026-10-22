<script lang="ts">
	// Moderation log overview (Moderations page). The reason is the content, everything else is supporting detail.
	import Avatar from '../Avatar.svelte';
	import Icon from '../Icon.svelte';
	import RobloxAvatar from '../RobloxAvatar.svelte';
	import { onBackdrop, portal, trap } from '../actions';
	import { api } from '../api';
	import { typeById } from '../config';
	import { ask, toast } from '../dialogs.svelte';
	import { isUrl } from '../format';
	import { S, ago, can } from '../store.svelte';
	import type { Moderation } from '../types';

	let { m, onclose }: { m: Moderation; onclose: () => void } = $props();

	const uid = $props.id();
	const t = $derived(typeById(m.type));
	let deleting = $state(false);
	// show "medal.tv/clip/…" instead of the whole link; the full link is in the tooltip
	const short = $derived.by(() => {
		try { const u = new URL(m.evidence); return u.host.replace(/^www\./, '') + u.pathname.replace(/\/$/, ''); } catch { return m.evidence; }
	});
	const when = $derived(new Date(m.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }));

	async function remove() {
		if (!await ask({ title: `Delete ${m.id}?`, text: "It's removed from the record for everyone. This doesn't undo anything in game.", ok: 'Delete log', danger: true })) return;
		deleting = true;
		try { await api(`/api/moderations/${encodeURIComponent(m.id)}/delete`, {}); }
		catch (err) { toast(`Couldn't delete ${m.id}: ${(err as Error).message}`); deleting = false; return; }
		S.moderations = S.moderations.filter(x => x.id !== m.id);
		onclose();
	}
</script>

<div class="drawer-back" use:portal use:trap={onclose} onmousedown={onBackdrop(onclose)} role="presentation">
	<div class="drawer ld" role="dialog" aria-modal="true" aria-labelledby="{uid}-t" style:--c={t.color}>
		<div class="ld-head">
			<div class="ld-meta"><span class="logbadge"><Icon name={t.icon} />{t.label}</span><span class="logid" translate="no">{m.id}</span></div>
			<button class="x" type="button" aria-label="Close" onclick={onclose} data-autofocus><Icon name="close" /></button>
		</div>
		<div class="ld-who">
			<RobloxAvatar name={m.user} src="/api/roblox/name/{encodeURIComponent(m.user)}/avatar?headshot=1" cls="xl" />
			<h2 class="ld-title" id="{uid}-t" translate="no">{m.user}</h2>
		</div>
		<blockquote class="ld-reason">{m.reason}</blockquote>
		<dl class="ld-list">
			{#if m.duration}<dt>Duration</dt><dd>{m.duration}</dd>{/if}
			{#if isUrl(m.evidence)}
				<dt>Evidence</dt><dd><a class="ld-link" href={m.evidence} target="_blank" rel="noopener noreferrer" title={m.evidence}><span>{short}</span><Icon name="external" /></a></dd>
			{/if}
			<dt>Moderator</dt><dd><span class="mod"><Avatar name={m.mod} url={m.modAvatar} />{m.mod}</span></dd>
			<dt>Logged</dt><dd><time datetime={new Date(m.at).toISOString()}>{when}</time> <span class="ld-ago">{ago(m.at)}</span></dd>
			{#if m.status && m.status !== 'Logged'}<dt>Status</dt><dd><span class="status">{m.status}</span></dd>{/if}
		</dl>
		{#if can('moderations.delete')}
			<div class="ld-foot"><button class="btn-danger" type="button" disabled={deleting} onclick={remove}><Icon name="trash" />{deleting ? 'Deleting…' : 'Delete log'}</button></div>
		{/if}
	</div>
</div>
