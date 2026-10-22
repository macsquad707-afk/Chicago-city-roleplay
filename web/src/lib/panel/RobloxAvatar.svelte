<script lang="ts">
	// Roblox headshot over the initials; if the picture fails, only the initials stay.
	import { initials, isRobloxId } from './format';

	let { name, id = '', src = '', cls = '' }: { name: string; id?: string; src?: string; cls?: string } = $props();
	const url = $derived(src || (isRobloxId(id) ? `/api/roblox/avatar/${id}?headshot=1` : ''));
	let failed = $state(false);
	$effect(() => { url; failed = false; });
</script>

<span class="avatar {cls}">{initials(name)}{#if url && !failed}<img src={url} alt="" loading="lazy" onerror={() => (failed = true)} />{/if}</span>
