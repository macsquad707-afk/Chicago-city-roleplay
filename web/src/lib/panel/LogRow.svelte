<script lang="ts">
	import Icon from './Icon.svelte';
	import { LOG_ICON } from './config';
	import { ago } from './store.svelte';
	import type { LogEntry } from './types';

	let { l, mono = false }: { l: LogEntry; mono?: boolean } = $props();
</script>

<div class="row">
	<span class="row-icon {l.type}"><Icon name={LOG_ICON[l.type] || 'pulse'} /></span>
	<span class="row-text"><b>{l.user}</b>
		{#if l.type === 'command'}<span class={mono ? 'mono' : ''}>ran {l.cmd}</span>
		{:else if l.type === 'join'}joined the server
		{:else if l.type === 'leave'}left the server
		{:else if l.type === 'kill'}killed <b>{l.target || 'someone'}</b>
		{:else if l.type === 'modcall'}called a moderator{l.text ? ' · ' + l.text : ''}
		{:else}{l.text || ''}{/if}
	</span>
	<span class="row-time">{ago(l.at)}</span>
</div>
