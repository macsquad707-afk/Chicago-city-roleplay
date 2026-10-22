<script lang="ts">
	import Box from '../Box.svelte';
	import Empty from '../Empty.svelte';
	import Icon from '../Icon.svelte';
	import PageHead from '../PageHead.svelte';
	import { api } from '../api';
	import { COMMAND_COOLDOWN_MS, QUICK_COMMANDS } from '../config';
	import { S, ago, clock, username } from '../store.svelte';

	let input = $state(''), busy = $state(false), until = $state(0);
	let field = $state<HTMLInputElement>();
	const left = $derived(Math.ceil((until - clock.now) / 1000));

	const run = async () => {
		let cmd = input.trim();
		if (!cmd || busy || Date.now() < until) return;
		if (!cmd.startsWith(':')) cmd = ':' + cmd;
		const name = cmd.split(/\s+/)[0].toLowerCase();
		let ok = false, error = '', sent = false;

		if (S.blockedCommands.includes(name)) {
			error = "Run this command in game. The panel won't send it.";
		} else {
			busy = true; sent = true;
			try {
				const d = await api('/api/commands', { command: cmd });
				ok = d.ok !== false;
				if (!ok) error = d.error;
			} catch (err) { error = (err as Error).message; }
			busy = false;
		}

		const now = Date.now();
		// the backend records sent commands; commands blocked here only show locally
		let synced = false;
		if (sent) try { S.commands = await api('/api/commands'); synced = true; } catch {}
		if (!synced) S.commands = [{ command: cmd, ok, error, user: username(), at: now }, ...S.commands];
		if (ok) input = '';
		if (sent) until = now + COMMAND_COOLDOWN_MS;
	};
</script>

<PageHead title="Commands" sub="Run in-game commands on your ER:LC server. ER:LC takes one command every 5 seconds." />
<div id="view" class="enter">
	<section class="term">
		<div class="term-head"><span class="term-title">{S.serverName ? S.serverName + ' · ER:LC' : 'ER:LC'}</span></div>
		<div class="term-body">
			<Icon name="chevron" />
			<input type="text" placeholder=":m Server restart in 5 minutes" autocomplete="off" spellcheck="false" aria-label="Command"
				bind:value={input} bind:this={field} onkeydown={e => { if (e.key === 'Enter') run(); }} />
			<button class="btn-primary run" type="button" disabled={busy || left > 0} onclick={run}>
				<Icon name="play" />{busy ? 'Running…' : left > 0 ? `Wait ${left}s` : 'Run'}
			</button>
		</div>
	</section>
	<div class="quick">
		{#each QUICK_COMMANDS as c}
			<button class="tile" type="button" onclick={() => { input = c.fill + ' '; field?.focus(); }}><b>{c.title}</b><span>{c.hint}</span></button>
		{/each}
	</div>
	<p class="quick-note">Run admin, mod and shutdown commands in game. The panel blocks them.</p>
	<Box title="History" icon="commands">
		<div class="hist">
			{#each S.commands.slice(0, 20) as h}
				<div class="hrow {h.ok ? 'ok' : 'fail'}">
					<Icon name={h.ok ? 'checkcircle' : 'xcircle'} />
					<span class="hcmd" title={h.command}>{h.command}</span>
					{#if !h.ok}<span class="herr" title={h.error}>{h.error}</span>{/if}
					<span class="hmeta">{h.user} &middot; {ago(h.at)}</span>
				</div>
			{:else}
				<Empty icon="commands" text="No commands run yet" />
			{/each}
		</div>
	</Box>
</div>
