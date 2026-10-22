export const DAY_MS = 864e5;

export const timeAgo = (at: number, now = Date.now()) => {
	const s = Math.max(0, Math.floor((now - at) / 1000));
	if (s < 60) return 'just now';
	if (s < 3600) return Math.floor(s / 60) + 'm ago';
	if (s < 86400) return Math.floor(s / 3600) + 'h ago';
	return Math.floor(s / 86400) + 'd ago';
};

export const fmtDur = (s: number) => {
	const sec = Math.max(0, s);
	return sec < 60 ? Math.floor(sec) + 's' : sec < 3600 ? Math.floor(sec / 60) + 'm' : Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm';
};

export const fmtClock = (sec: number) => {
	const t = Math.floor(sec), z = (n: number) => String(n).padStart(2, '0');
	return `${Math.floor(t / 3600)}:${z(Math.floor((t % 3600) / 60))}:${z(t % 60)}`;
};

export const fmtDateTime = (ms: number) =>
	new Date(ms).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(', ', ' ');

// Quota weeks run Monday 00:00 UTC to Monday 00:00 UTC, same as backend.py.
export const nextWeekStart = () => {
	const d = new Date();
	d.setUTCHours(0, 0, 0, 0);
	d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7));
	return d.getTime();
};
export const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const fmtDay = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const greeting = () => {
	const h = new Date().getHours();
	return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const initials = (name: string) => (name || '?').slice(0, 2).toUpperCase();
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
export const isUrl = (s: string) => /^https?:\/\//i.test(s || '');
export const isRobloxId = (id: string) => /^\d+$/.test(id || '');
