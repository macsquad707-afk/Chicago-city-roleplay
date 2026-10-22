<script lang="ts">
	// Discord avatar, or initials when there's no https picture.
	import { initials } from './format';

	let { name, url = '', cls = '' }: { name: string; url?: string; cls?: string } = $props();
	const safe = $derived(/^https:\/\//i.test(url || ''));
</script>

<span class="mavatar {cls}" style:background-image={safe ? `url('${url.replace(/'/g, '%27')}')` : undefined}>{safe ? '' : initials(name)}</span>
