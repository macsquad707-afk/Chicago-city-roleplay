<script lang="ts">
	// Pick a staff member's roles. Roles the viewer can't hand out are shown but locked.
	import FormDialog from '../FormDialog.svelte';
	import { api } from '../api';
	import { toast } from '../dialogs.svelte';
	import { S } from '../store.svelte';
	import type { StaffMember } from '../types';

	let { m, onclose }: { m: StaffMember; onclose: () => void } = $props();

	if (!S.roles.length) { toast('There are no roles yet. Create one on the Roles page.'); queueMicrotask(() => onclose()); }
	// svelte-ignore state_referenced_locally
	let picked = $state([...m.roles]);
	const save = async () => { S.staff = await api(`/api/staff/${encodeURIComponent(m.id)}/roles`, { roles: picked }); };
</script>

{#if S.roles.length}
<FormDialog title="Roles for {m.name}" sub="They get everything their roles allow." submitLabel="Save roles" onsubmit={save} {onclose}>
	<div class="role-pick">
		{#each S.roles as r (r.id)}
			{@const ok = m.assignable.includes(r.id)}
			<label class="role-opt" class:locked={!ok} style:--c={r.color}>
				<input type="checkbox" value={r.id} bind:group={picked} disabled={!ok} />
				<i></i><span>{r.name}</span>{#if !ok}<small>Above your role</small>{/if}
			</label>
		{/each}
	</div>
</FormDialog>
{/if}
