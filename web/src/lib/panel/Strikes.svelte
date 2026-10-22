<script lang="ts">
	import { S } from './store.svelte';

	let { n }: { n: number } = $props();
</script>

<span class="strikes" role="img" aria-label="{n} of {S.maxStrikes} strikes">{#each { length: S.maxStrikes } as _, i}<i class:on={i < n}></i>{/each}</span>
