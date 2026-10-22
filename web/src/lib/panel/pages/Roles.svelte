<script lang="ts">
	import Empty from '../Empty.svelte';
	import FormDialog from '../FormDialog.svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import { api } from '../api';
	import { ask, toast } from '../dialogs.svelte';
	import { plural } from '../format';
	import { S } from '../store.svelte';
	import type { RoleFull } from '../types';

	let roles = $state<RoleFull[] | null>(null), error = $state('');
	let busy = $state<number | null>(null);
	// the role form: null = closed, { role: null } = new role
	let form = $state<{ role: RoleFull | null } | null>(null);
	let name = $state(''), color = $state('#22b8cf');

	const set = (list: RoleFull[]) => { roles = list; S.roles = list.map(({ id, name, color }) => ({ id, name, color })); };
	api<RoleFull[]>('/api/roles').then(set).catch(err => { error = err.message; });

	const openForm = (role: RoleFull | null) => { name = role?.name ?? ''; color = role?.color ?? '#22b8cf'; form = { role }; };
	const save = async () => set(await api(form!.role ? '/api/roles/' + form!.role.id : '/api/roles', { name, color }));

	const act = async (r: RoleFull, action: 'up' | 'down' | 'delete') => {
		if (action === 'delete' && !await ask({ title: `Delete ${r.name}?`,
			text: `${r.members} ${r.members === 1 ? 'person loses' : 'people lose'} this role and everything it allows. This can't be undone.`, ok: 'Delete role', danger: true })) return;
		busy = r.id;
		try { set(await api('/api/roles/' + r.id, { action })); } catch (err) { toast((err as Error).message); }
		busy = null;
	};
</script>

<PageHead title="Roles" sub="Roles higher on the list outrank the ones below. Set what each role can do in Settings.">
	{#snippet tools()}
		<button class="btn-primary" type="button" onclick={() => openForm(null)}><Icon name="plus" />New role</button>
	{/snippet}
</PageHead>
<div id="view" class="enter">
	<section class="panel">
		<div>
			{#if !roles}
				<Empty icon={error ? 'alert' : 'loading'} text={error || 'Loading…'} h={160} />
			{:else}
				{#each roles as r, i (r.id)}
					<div class="role-row" style:--c={r.color}>
						<i class="role-swatch"></i>
						<div class="role-main"><b>{r.name}</b><small>{plural(r.members, 'person', 'people')} &middot; {plural(r.perms.length, 'permission', 'permissions')}</small></div>
						<div class="role-acts">
							<button class="dots-btn" type="button" aria-label="Move {r.name} up" title="Move up" disabled={i === 0 || busy === r.id} onclick={() => act(r, 'up')}><Icon name="up" /></button>
							<button class="dots-btn" type="button" aria-label="Move {r.name} down" title="Move down" disabled={i === roles.length - 1 || busy === r.id} onclick={() => act(r, 'down')}><Icon name="down" /></button>
							<button class="dots-btn" type="button" aria-label="Edit {r.name}" title="Edit" onclick={() => openForm(r)}><Icon name="pencil" /></button>
							<button class="dots-btn" type="button" aria-label="Delete {r.name}" title="Delete" disabled={busy === r.id} onclick={() => act(r, 'delete')}><Icon name="trash" /></button>
						</div>
					</div>
				{:else}
					<div class="q-empty"><Icon name="roles" /><b>No roles yet</b><span>Create a role, then tick what it can do in Settings.</span></div>
				{/each}
			{/if}
		</div>
	</section>
</div>

{#if form}
	<FormDialog title={form.role ? `Edit ${form.role.name}` : 'New role'} sub="Pick a name and color staff will see." submitLabel={form.role ? 'Save role' : 'Create role'} onsubmit={save} onclose={() => (form = null)}>
		<div class="q-pair role-fields">
			<label class="field"><span>Name <em>*</em></span><input maxlength="32" placeholder="e.g. Senior Mod" autocomplete="off" bind:value={name} /></label>
			<label class="field"><span>Color</span><input type="color" bind:value={color} /></label>
		</div>
	</FormDialog>
{/if}
