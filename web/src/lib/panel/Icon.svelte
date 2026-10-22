<script lang="ts">
	import { ICONS, type IconName } from './icons';

	let { name }: { name: IconName } = $props();
</script>

<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{@html ICONS[name]}</svg>
