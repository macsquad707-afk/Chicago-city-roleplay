// Moves a dialog to <body>, so a transformed parent (page animations) can't trap its fixed position.
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return { destroy() { node.remove(); } };
}

// Dialog behaviour: focus moves in and is kept inside, Escape closes, and focus goes back to the
// opener on close. Only the dialog on top reacts, so a dialog opened from a drawer handles its own keys.
// Focus starts on [data-autofocus], else the first field in the body, else the first button.
export function trap(node: HTMLElement, onclose: () => void) {
	const opener = document.activeElement as HTMLElement | null;
	node.setAttribute('data-trap', '');
	const onKey = (e: KeyboardEvent) => {
		const open = document.querySelectorAll('[data-trap]');
		if (open[open.length - 1] !== node) return;
		if (e.key === 'Escape') { e.preventDefault(); onclose(); return; }
		if (e.key !== 'Tab') return;
		const f = [...node.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea, select')].filter(el => el.offsetParent);
		if (!f.length) return;
		const first = f[0], last = f[f.length - 1];
		if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
		else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
	};
	document.addEventListener('keydown', onKey);
	(node.querySelector<HTMLElement>('[data-autofocus]') ?? node.querySelector<HTMLElement>('.modal-body input, .modal-body textarea') ?? node.querySelector<HTMLElement>('button'))?.focus();
	return {
		update(fn: () => void) { onclose = fn; },
		destroy() {
			document.removeEventListener('keydown', onKey);
			if (opener?.isConnected) opener.focus();
		}
	};
}

// Closes a dialog when the backdrop itself (not its content) is pressed.
export const onBackdrop = (close: () => void) => (e: MouseEvent) => { if (e.target === e.currentTarget) close(); };
