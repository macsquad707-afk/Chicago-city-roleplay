// Shared panel data, filled from backend.py and kept fresh by Panel.svelte.
import { api } from './api';
import { normalizePlayers } from './config';
import { DAY_MS, timeAgo } from './format';
import type { ActiveShift, CommandRun, Config, LogEntry, Me, Moderation, Overview, Player, Role, Shift, StaffMember } from './types';

export const S = $state({
	me: null as Me | null,
	perms: [] as string[],
	pages: [] as string[],
	roles: [] as Role[], // panel roles, highest first
	// these four are replaced by the server's settings on load
	blockedCommands: [':admin', ':unadmin', ':mod', ':unmod', ':helper', ':unhelper', ':shutdown'],
	logRetentionDays: 14,
	commandRetentionDays: 30,
	maxStrikes: 3,
	serverName: '', // from ER:LC
	maxPlayers: 0,
	overview: null as Overview | null,
	players: [] as Player[],
	moderations: [] as Moderation[], // newest first
	activeShifts: [] as ActiveShift[], // staff clocked in right now
	shifts: [] as Shift[], // finished, newest first
	staff: [] as StaffMember[], // highest role first
	commands: [] as CommandRun[], // newest first
	logs: [] as LogEntry[] // newest first. ER:LC only keeps recent logs; backend.py stores them as it polls.
});

// Ticks every second (Panel.svelte), so "5m ago" and shift timers stay fresh.
export const clock = $state({ now: Date.now() });
export const ago = (at: number) => timeAgo(at, clock.now);

export const can = (perm: string) => S.perms.includes(perm);
export const username = () => S.me?.name ?? '';

export const applyConfig = (c: Config) => {
	S.blockedCommands = c.blockedCommands;
	S.logRetentionDays = c.logRetentionDays;
	S.commandRetentionDays = c.commandRetentionDays;
	S.maxStrikes = c.maxStrikes;
	if (c.roles) S.roles = c.roles;
};

export const setShifts = (s: { active: ActiveShift[]; finished: Shift[] }) => { S.activeShifts = s.active; S.shifts = s.finished; };

// Time on break doesn't count, and a revoked shift counts as 0s.
export const activeSeconds = (a: { started: number; breakMs: number; onBreak: boolean; breakStartedAt: number }) =>
	Math.max(0, (clock.now - a.started - a.breakMs - (a.onBreak ? clock.now - a.breakStartedAt : 0)) / 1000);
// manual rows are "add/remove time" entries, so they may be negative
export const doneSeconds = (sh: { revoked: boolean; manual: boolean; adjustMs: number; started: number; ended: number | null; breakMs: number }) =>
	sh.revoked ? 0 : sh.manual ? sh.adjustMs / 1000 : Math.max(0, ((sh.ended ?? 0) - sh.started - sh.breakMs + (sh.adjustMs || 0)) / 1000);
export const isOnShift = (name: string) => S.activeShifts.some(a => a.name === name);
export const weekSecondsFor = (name: string) => {
	const since = clock.now - 7 * DAY_MS;
	return S.shifts.filter(x => x.user === name && x.ended >= since).reduce((t, x) => t + doneSeconds(x), 0)
		+ S.activeShifts.filter(a => a.name === name).reduce((t, a) => t + activeSeconds(a), 0);
};

export const loadPlayers = async () => { S.players = normalizePlayers(await api('/api/players')); };

export const loadState = async () => {
	const s = await api('/api/state');
	if (s.overview) {
		S.overview = s.overview;
		S.maxPlayers = s.overview.maxPlayers;
		S.serverName = s.overview.name;
	}
	if (s.moderations) S.moderations = s.moderations;
	if (s.shifts) setShifts(s.shifts);
	if (s.staff) S.staff = s.staff;
	if (s.roles) S.roles = s.roles;
	if (s.commands) S.commands = s.commands;
	if (S.pages.includes('serverlogs')) S.logs = await api('/api/logs');
};

// Re-fetch everything this person can see. Failures keep the last good data.
export const refresh = () => Promise.all([
	loadState().catch(() => {}),
	S.pages.includes('players') && loadPlayers().catch(() => {})
]);
