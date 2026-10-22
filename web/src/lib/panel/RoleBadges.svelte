<script lang="ts">
	import { S } from './store.svelte';
	import type { Role, StaffMember } from './types';

	let { m }: { m: StaffMember } = $props();
	const roles = $derived(m.roles.map(id => S.roles.find(r => r.id === id)).filter((r): r is Role => !!r));
</script>

{#if m.roles.length}
	{#each roles as r (r.id)}<span class="rankbadge" style:--c={r.color}>{r.name}</span>{/each}
{:else}
	<span class="rankbadge" style:--c={m.rankColor}>{m.rank}</span>
{/if}
