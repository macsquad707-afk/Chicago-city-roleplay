<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	let { icon, text, h }: { icon: IconName; text: string; h?: number } = $props();
</script>

<div class="empty" style:min-height={h ? h + 'px' : undefined}><Icon name={icon} /><span>{text}</span></div>
