<script lang="ts">
	// A titled card ("panel" in the CSS).
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	let { title, icon, link, cls = '', extra, children }: {
		title: string; icon: IconName; link?: { href: string; text: string }; cls?: string; extra?: Snippet; children: Snippet;
	} = $props();
</script>

<section class="panel {cls}">
	<div class="panel-head">
		<span class="t"><Icon name={icon} />{title}</span>
		{#if link}<a href={link.href}>{link.text}</a>{/if}
		{@render extra?.()}
	</div>
	{@render children()}
</section>
