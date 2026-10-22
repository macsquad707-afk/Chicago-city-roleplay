// Shapes of what backend.py sends. Times are ms timestamps.

export interface Me {
	id: string; name: string; avatar: string; owner: boolean;
	perms: string[]; pages: string[];
	config: Config;
}
export interface Config {
	blockedCommands: string[]; logRetentionDays: number; commandRetentionDays: number; maxStrikes: number;
	roles?: Role[];
}
export interface Role { id: number; name: string; color: string }
// Roles page / settings: a role with what it allows and how many people have it
export interface RoleFull extends Role { perms: string[]; members: number; position?: number }

export interface Player {
	name: string; id: string; team: string; callsign: string; permission: string;
	x?: number; z?: number; street: string; postal: string; location: string;
}
export interface Moderation {
	id: string; type: string; user: string; reason: string; evidence: string; duration: string;
	mod: string; modAvatar: string; status: string; at: number;
}
export interface ActiveShift { name: string; avatar: string; started: number; onBreak: boolean; breakStartedAt: number; breakMs: number }
// Finished shift. manual rows are "add/remove time" entries, so adjustMs may be negative.
export interface Shift {
	id: number; user: string; avatar: string; started: number; ended: number;
	breakMs: number; adjustMs: number; manual: boolean; revoked: boolean; logs: number;
}
// A shift on a staff profile: ended is null while it's running
export interface ProfileShift {
	id: number; started: number; ended: number | null; breakMs: number; onBreak: boolean; breakStartedAt: number;
	adjustMs: number; manual: boolean; revoked: boolean; revokedBy: string;
}
export interface StaffMember {
	id: string; name: string; handle: string; avatar: string; rank: string; rankColor: string;
	roles: number[]; assignable: number[]; strikes: number; since: number; canManage: boolean;
}
export interface LogEntry { type: string; user: string; cmd?: string; target?: string; text?: string; at: number }
export interface CommandRun { command: string; ok: boolean; error: string; user: string; at: number }
export interface ModCall { user: string; id: string; at: number }
export interface Ban { name: string; id: string }
export interface Overview {
	erlcOk: boolean; error: string; name: string; players: number; maxPlayers: number; onTeam: number; queue: number;
	staff: { admin: number; mod: number; helper: number; total: number };
	modCalls: ModCall[]; logsToday: number; bolos: number;
}
export interface Settings {
	blockedCommands: string[]; autoErlc: boolean; maxStrikes: number; maxOnShift: number;
	logRetentionDays: number; commandRetentionDays: number;
	quotas: { enabled: boolean; since: number; hours: Record<string, number> };
	roles: RoleFull[]; perms: string[];
}
