<script lang="ts">
	// Small dialog around a form. If onsubmit throws, its message shows above the buttons; otherwise the dialog closes.
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { onBackdrop, portal, trap } from './actions';

	let { title, sub, submitLabel, onsubmit, onclose, children }: {
		title: string; sub: string; submitLabel: string;
		onsubmit: () => Promise<unknown> | unknown; onclose: () => void; children: Snippet;
	} = $props();

	const uid = $props.id();
	let err = $state(''), busy = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		try { await onsubmit(); onclose(); }
		catch (x) { err = (x as Error).message; busy = false; }
	}
</script>

<div class="modal-back" use:portal use:trap={onclose} onmousedown={onBackdrop(onclose)} role="presentation">
	<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
	<form class="modal" role="dialog" aria-modal="true" aria-labelledby="{uid}-t" novalidate onsubmit={submit}>
		<div class="modal-head">
			<div><h2 id="{uid}-t">{title}</h2><p>{sub}</p></div>
			<button class="x" type="button" aria-label="Close" onclick={onclose}><Icon name="close" /></button>
		</div>
		<div class="modal-body">{@render children()}<p class="f-err" role="alert">{err}</p></div>
		<div class="modal-foot">
			<button class="btn-ghost" type="button" onclick={onclose}>Cancel</button>
			<button class="btn-primary" type="submit" disabled={busy}><Icon name="check" />{submitLabel}</button>
		</div>
	</form>
</div>
