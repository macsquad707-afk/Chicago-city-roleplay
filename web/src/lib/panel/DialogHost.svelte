<script lang="ts">
	import Icon from './Icon.svelte';
	import { onBackdrop, portal, trap } from './actions';
	import { ui } from './dialogs.svelte';

	const uid = $props.id();
	let value = $state('');

	$effect(() => { value = ui.ask?.input ?? ''; });

	const done = (v: true | string | null) => {
		const a = ui.ask;
		ui.ask = null;
		a?.resolve(v);
	};
	const yes = () => done(ui.ask?.input == null ? true : value);
</script>

{#if ui.toast}
	{#key ui.toast.key}<div class="toast" role="alert">{ui.toast.msg}</div>{/key}
{/if}

{#if ui.ask}
	{@const a = ui.ask}
	<div class="modal-back" use:portal use:trap={() => done(null)} onmousedown={onBackdrop(() => done(null))} role="presentation">
		<div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="{uid}-t">
			<div class="modal-head"><div><h2 id="{uid}-t">{a.title}</h2>{#if a.text}<p>{a.text}</p>{/if}</div></div>
			{#if a.input != null}
				<div class="modal-body"><label class="field">
					<input type="text" autocomplete="off" aria-labelledby="{uid}-t" bind:value data-autofocus
						onkeydown={e => { if (e.key === 'Enter') { e.preventDefault(); yes(); } }} />
				</label></div>
			{/if}
			<div class="modal-foot">
				<button class="btn-ghost" type="button" onclick={() => done(null)}>{a.no ?? 'Cancel'}</button>
				<button class={a.danger ? 'btn-danger' : 'btn-primary'} type="button" onclick={yes} data-autofocus={a.input == null || undefined}>
					<Icon name={a.danger ? 'alert' : 'check'} />{a.ok ?? 'OK'}
				</button>
			</div>
		</div>
	</div>
{/if}
