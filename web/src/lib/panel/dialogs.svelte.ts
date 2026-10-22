// In-page replacements for alert/confirm/prompt. DialogHost.svelte draws them.

export interface AskOpts { title: string; text?: string; ok?: string; no?: string; danger?: boolean; input?: string | null }
interface AskReq extends AskOpts { resolve: (v: any) => void }

export const ui = $state({
	toast: null as { msg: string; key: number } | null,
	ask: null as AskReq | null
});

let toastTimer: ReturnType<typeof setTimeout>;
// Short messages and errors.
export function toast(msg: string) {
	ui.toast = { msg, key: Date.now() };
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => (ui.toast = null), 6000);
}

// Resolves to true (no input), the typed text (input set), or null when cancelled.
export function ask(o: AskOpts & { input: string }): Promise<string | null>;
export function ask(o: AskOpts): Promise<true | null>;
export function ask(o: AskOpts): Promise<true | string | null> {
	return new Promise(resolve => {
		ui.ask?.resolve(null);
		ui.ask = { ...o, resolve };
	});
}
