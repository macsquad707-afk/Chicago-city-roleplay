<script lang="ts">
	// "New moderation log" dialog. onsaved(entry) runs after the log is saved.
	import Icon from '../Icon.svelte';
	import { onBackdrop, portal, trap } from '../actions';
	import { api } from '../api';
	import { MOD_TYPES } from '../config';
	import { toast } from '../dialogs.svelte';
	import { S, can } from '../store.svelte';
	import type { Moderation } from '../types';

	let { initialType = '', player = '', onsaved, onclose }: {
		initialType?: string; player?: string; onsaved?: (entry: Moderation) => void; onclose: () => void;
	} = $props();

	const uid = $props.id();
	const types = MOD_TYPES.filter(t => can('log.' + t.id));
	if (!types.length) { toast("Your roles can't log moderations."); queueMicrotask(() => onclose()); }

	// svelte-ignore state_referenced_locally
	let type = $state(types.find(t => t.id === initialType) || types[0]);
	// svelte-ignore state_referenced_locally
	let user = $state(player);
	let duration = $state(''), reason = $state(''), evidence = $state(''), pm = $state(true), busy = $state(false);

	const pmOk = $derived(type?.id === 'warning' || type?.id === 'kick');
	const valid = $derived(!!(user.trim() && reason.trim() && (type.id !== 'tempban' || duration.trim())));

	async function submit() {
		if (!valid) return;
		busy = true;
		let d: { entry: Moderation; erlc: { sent: boolean; ok: boolean; error: string } };
		try {
			d = await api('/api/moderations', {
				type: type.id, user: user.trim(), reason: reason.trim(), evidence: evidence.trim(),
				duration: type.id === 'tempban' ? duration.trim() : '',
				pm: pmOk && pm
			});
		} catch (err) {
			toast((err as Error).message);
			busy = false;
			return;
		}
		S.moderations = [d.entry, ...S.moderations];
		onclose();
		if (d.erlc.sent && !d.erlc.ok) toast('Logged, but ER:LC refused the command: ' + d.erlc.error);
		onsaved?.(d.entry);
	}
</script>

{#if types.length}
	<div class="modal-back" use:portal use:trap={onclose} onmousedown={onBackdrop(onclose)} role="presentation">
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby="{uid}-t">
			<div class="modal-head">
				<div><h2 id="{uid}-t">New moderation log</h2><p>This goes on the player's record.</p></div>
				<button class="x" type="button" aria-label="Close" onclick={onclose}><Icon name="close" /></button>
			</div>
			<div class="modal-body">
				<div class="types">
					{#each types as t (t.id)}
						<button type="button" class="type-card" class:sel={t.id === type.id} style:--c={t.color} aria-pressed={t.id === type.id} onclick={() => (type = t)}>
							<span class="tt"><Icon name={t.icon} />{t.label}</span><span class="td">{t.desc}</span>
						</button>
					{/each}
				</div>
				<label class="field"><span>Player <em>*</em></span>
					<input type="text" placeholder="Roblox username" autocomplete="off" list="{uid}-pl" bind:value={user} data-autofocus={!player || undefined} />
					<datalist id="{uid}-pl">{#each S.players as p}<option value={p.name}></option>{/each}</datalist>
					<small>Pick someone in game or type a Roblox username.</small>
				</label>
				{#if type.id === 'tempban'}
					<label class="field"><span>Duration <em>*</em></span>
						<input type="text" placeholder="e.g. 3 days" autocomplete="off" bind:value={duration} />
					</label>
				{/if}
				<label class="field"><span>Reason <em>*</em></span>
					<textarea placeholder="What happened, and which rule it broke" bind:value={reason} data-autofocus={!!player || undefined}></textarea>
				</label>
				<label class="field"><span>Evidence</span>
					<input type="text" placeholder="https://medal.tv/…" autocomplete="off" bind:value={evidence} />
					<small>A link to a clip or screenshot (optional).</small>
				</label>
				{#if pmOk}
					<label class="pm">
						<span class="pm-icon"><Icon name="bolt" /></span>
						<span class="pm-text"><span>{type.id === 'kick' ? 'Send them the kick reason as an in-game PM' : 'Send them the warning as an in-game PM'}</span><small>Runs through your ER:LC server key.</small></span>
						<span class="switch"><input type="checkbox" bind:checked={pm} /><i></i></span>
					</label>
				{/if}
			</div>
			<div class="modal-foot">
				<button class="btn-ghost" type="button" onclick={onclose}>Cancel</button>
				<button class="btn-primary" type="button" disabled={!valid || busy} onclick={submit}><Icon name={type.icon} />{type.cta}</button>
			</div>
		</div>
	</div>
{/if}
