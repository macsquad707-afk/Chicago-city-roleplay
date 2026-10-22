<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, sub = '', tools }: { title: string; sub?: string; tools?: Snippet } = $props();
</script>

<div class="page-head enter">
	<div>
		<h1>{title}</h1>
		<p class="sub">{sub}</p>
	</div>
	<div class="head-tools">{@render tools?.()}</div>
</div>
