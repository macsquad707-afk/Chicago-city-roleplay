// ---------- CONFIG: edit these ----------
import type { IconName } from './icons';
import type { Ban, Player } from './types';

export const DEFAULT_PAGE = 'overview';

export interface NavItem { id: IconName; label: string; sub: string } // id doubles as the page's icon
export const NAV: { group: string; items: NavItem[] }[] = [
	{ group: 'Server', items: [
		{ id: 'overview', label: 'Overview', sub: 'A quick look at how the server is doing.' },
		{ id: 'players', label: 'Players', sub: 'Everyone currently in the server.' },
		{ id: 'livemap', label: 'Live map', sub: 'Live player positions.' }
	]},
	{ group: 'Moderation', items: [
		{ id: 'moderations', label: 'Moderations', sub: 'Warnings, kicks and other actions.' },
		{ id: 'bans', label: 'Bans', sub: 'Active and past bans.' },
		{ id: 'serverlogs', label: 'Server logs', sub: 'Join, leave, and command logs.' },
		{ id: 'commands', label: 'Commands', sub: 'Run commands on the server.' }
	]},
	{ group: 'Team', items: [
		{ id: 'staff', label: 'Staff', sub: 'Your staff team.' },
		{ id: 'shifts', label: 'Shifts', sub: 'Staff shift history.' },
		{ id: 'quotas', label: 'Quotas & leave', sub: 'Weekly shift goals and time away.' },
		{ id: 'roles', label: 'Roles', sub: 'Panel roles you can give staff. What each role can do is set in Settings.' },
		{ id: 'settings', label: 'Settings', sub: 'Who can do what, and how the panel behaves.' }
	]}
];

export const TEAM_COLORS: Record<string, string> = { Civilian: '#6b6e75', Police: '#3b82f6', Sheriff: '#3ddc97', Fire: '#ef4444', DOT: '#f5a623', Jail: '#c08457' };
export const teamColor = (t: string) => TEAM_COLORS[t] || '#6b6e75';
// keys are the Permission values ER:LC sends
export const PERM_COLORS: Record<string, string> = { 'Server Owner': '#e6ebf0', 'Server Co-Owner': '#8b5cf6', 'Server Administrator': '#ef4444', 'Server Moderator': '#f5a623', 'Server Helper': '#22b8cf' };
export const isStaff = (p: Player) => !!PERM_COLORS[p.permission];

// Moderation types (labels, colors, descriptions come from your UI)
export interface ModType { id: string; label: string; color: string; icon: IconName; desc: string; verb: string; cta: string }
export const MOD_TYPES: ModType[] = [
	{ id: 'warning', label: 'Warning', color: '#f5a623', icon: 'warn', desc: 'A formal warning on their record', verb: 'warned', cta: 'Log warning' },
	{ id: 'kick', label: 'Kick', color: '#f97316', icon: 'logout', desc: 'Removed from the server', verb: 'kicked', cta: 'Log kick' },
	{ id: 'ban', label: 'Ban', color: '#ef4444', icon: 'bans', desc: 'Banned until staff unban them', verb: 'banned', cta: 'Log ban' },
	{ id: 'tempban', label: 'Temp ban', color: '#f43f5e', icon: 'stopwatch', desc: 'Banned for a set time', verb: 'temp banned', cta: 'Log temp ban' },
	{ id: 'bolo', label: 'Ban BOLO', color: '#a855f7', icon: 'eye', desc: 'Ban them as soon as they are back in game', verb: 'added a ban BOLO for', cta: 'Log ban BOLO' },
	{ id: 'note', label: 'Note', color: '#8b8f98', icon: 'note', desc: 'A private note for staff', verb: 'added a note on', cta: 'Log note' }
];
export const typeById = (id: string) => MOD_TYPES.find(t => t.id === id) || MOD_TYPES[0];

export const PERM_LABELS: Record<string, string> = {
	'overview.view': 'See the overview', 'players.view': 'See players', 'livemap.view': 'See the live map',
	'moderations.view': 'See and log moderations', 'bans.view': 'See bans', 'bans.remove': 'Unban players', 'logs.view': 'See server logs', 'logs.clear': 'Clear server logs', 'moderations.delete': 'Delete moderation logs',
	'commands.run': 'Run commands', 'staff.view': 'See the staff team', 'staff.manage': 'Manage staff (strikes, shifts, leave)',
	'shifts.use': 'Clock in for shifts', 'roles.assign': 'Give staff roles',
	'settings.manage': 'Change settings and roles'
};
export const PERM_GROUPS: [string, string[]][] = [
	['Server', ['overview.view', 'players.view', 'livemap.view']],
	['Moderation', ['moderations.view', 'moderations.delete', 'bans.view', 'bans.remove', 'logs.view', 'logs.clear', 'commands.run']],
	['Team', ['staff.view', 'staff.manage', 'roles.assign', 'shifts.use', 'settings.manage']]
];

// ---------- Server logs ----------
// type: "command" | "join" | "leave" | "kill" | "modcall"
export const LOGS_POLL_MS = 10000;
export const LOG_ICON: Record<string, IconName> = { command: 'commands', join: 'login', leave: 'logout', kill: 'target', modcall: 'phone' };

// ---------- Commands ----------
// The panel POSTs { "command": ":h Hello" } to /api/commands and gets { "ok": true } or { "ok": false, "error": "..." }.
export const COMMAND_COOLDOWN_MS = 5000; // ER:LC allows one command every 5 seconds
export const QUICK_COMMANDS = [
	{ title: 'Server message', fill: ':m', hint: ':m' },
	{ title: 'Hint', fill: ':h', hint: ':h' },
	{ title: 'Private message', fill: ':pm', hint: ':pm username' },
	{ title: 'Kick', fill: ':kick', hint: ':kick username reason' },
	{ title: 'Ban', fill: ':ban', hint: ':ban username' },
	{ title: 'Unban', fill: ':unban', hint: ':unban username' },
	{ title: 'Priority timer', fill: ':prty', hint: ':prty 120' },
	{ title: 'Peace timer', fill: ':pt', hint: ':pt 120' }
];

// ---------- Live map ----------
// Best option: keep the map image on your own site (static/img/map.png). Remote links can be blocked by hotlink protection.
export const MAP_URL = '/img/map.png';
export const MAP_FALLBACKS = ['https://api.erlc.gg/maps/fall_postals.png'];
// World-coordinate range the map image covers. Checked against a live player at postal 210. Fine-tune by turning on
// SHOW_COORDS, hovering a spot you know (like a postal), and adjusting until the pins line up.
export const MAP_BOUNDS = { xMin: 0, xMax: 5355, zMin: 0, zMax: 5355 }; // 1 stud = 1 pixel on the 5355px official map
export const FLIP_Z = false; // set true if pins look mirrored top-to-bottom
export const SHOW_COORDS = false; // shows world X / Z under the cursor (for calibration)
export const LIVE_POLL_MS = 5000;

// Accepts the raw ER:LC v2 response ({ Players: [...] }) or a plain array.
export const normalizePlayers = (raw: any): Player[] => {
	const list: any[] = Array.isArray(raw) ? raw : (raw && (raw.Players || raw.players)) || [];
	return list.map(p => {
		const [name, id] = String(p.Player || p.name || '').split(':');
		const L = p.Location || {};
		const street = L.StreetName || p.street || '', postal = L.PostalCode || p.postal || '';
		return {
			name, id: id || p.id || '',
			team: p.Team || p.team || 'Civilian',
			callsign: p.Callsign || p.callsign || '',
			permission: p.Permission || p.permission || 'Normal',
			x: L.LocationX ?? p.x, z: L.LocationZ ?? p.z,
			street, postal,
			location: [postal ? 'Postal ' + postal : '', street].filter(Boolean).join(' · ') || '–'
		};
	}).filter(p => p.name);
};

// ER:LC answers GET /v1/server/bans with { "<userId>": "<username>", ... }
export const normalizeBans = (raw: any): Ban[] => Array.isArray(raw)
	? raw.map(b => ({ name: String(b.name || b.Name || ''), id: String(b.id || b.Id || '') })).filter(b => b.name || b.id)
	: Object.entries(raw || {}).map(([id, name]) => ({ id, name: String(name) }));
