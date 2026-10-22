// ---------- CONFIG: edit these ----------
  const DEFAULT_PAGE = "overview";

  // Simple 24x24 stroke icons
  const ICONS = {
    // Lucide icons (lucide-static 0.460.0, ISC license). Copy new ones from lucide.dev, inner SVG only.
    overview:   '<rect width="7" height="9" x="3" y="3" rx="1"/> <rect width="7" height="5" x="14" y="3" rx="1"/> <rect width="7" height="9" x="14" y="12" rx="1"/> <rect width="7" height="5" x="3" y="16" rx="1"/>',
    players:    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <circle cx="9" cy="7" r="4"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    livemap:    '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/> <path d="M15 5.764v15"/> <path d="M9 3.236v15"/>',
    moderations:'<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/> <path d="m16 16 6-6"/> <path d="m8 8 6-6"/> <path d="m9 7 8 8"/> <path d="m21 11-8-8"/>',
    bans:       '<circle cx="12" cy="12" r="10"/> <path d="m4.9 4.9 14.2 14.2"/>',
    serverlogs: '<path d="M15 12h-5"/> <path d="M15 8h-5"/> <path d="M19 17V5a2 2 0 0 0-2-2H4"/> <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    commands:   '<path d="m7 11 2-2-2-2"/> <path d="M11 13h4"/> <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>',
    staff:      '<circle cx="18" cy="15" r="3"/> <circle cx="9" cy="7" r="4"/> <path d="M10 15H6a4 4 0 0 0-4 4v2"/> <path d="m21.7 16.4-.9-.3"/> <path d="m15.2 13.9-.9-.3"/> <path d="m16.6 18.7.3-.9"/> <path d="m19.1 12.2.3-.9"/> <path d="m19.6 18.7-.4-1"/> <path d="m16.8 12.3-.4-1"/> <path d="m14.3 16.6 1-.4"/> <path d="m20.7 13.8 1-.4"/>',
    shifts:     '<circle cx="12" cy="12" r="10"/> <polyline points="12 6 12 12 16 14"/>',
    pulse:      '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    warn:       '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/> <path d="M12 9v4"/> <path d="M12 17h.01"/>',
    stopwatch:  '<line x1="10" x2="14" y1="2" y2="2"/> <line x1="12" x2="15" y1="14" y2="11"/> <circle cx="12" cy="14" r="8"/>',
    note:       '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/> <path d="M15 3v4a2 2 0 0 0 2 2h4"/>',
    plus:       '<path d="M5 12h14"/> <path d="M12 5v14"/>',
    close:      '<path d="M18 6 6 18"/> <path d="m6 6 12 12"/>',
    settings:   '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/> <circle cx="12" cy="12" r="3"/>',
    check:      '<path d="M20 6 9 17l-5-5"/>',
    pencil:     '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/> <path d="m15 5 4 4"/>',
    bolt:       '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    hash:       '<line x1="4" x2="20" y1="9" y2="9"/> <line x1="4" x2="20" y1="15" y2="15"/> <line x1="10" x2="8" y1="3" y2="21"/> <line x1="16" x2="14" y1="3" y2="21"/>',
    target:     '<circle cx="12" cy="12" r="10"/> <circle cx="12" cy="12" r="6"/> <circle cx="12" cy="12" r="2"/>',
    minus:      '<path d="M5 12h14"/>',
    expand:     '<path d="M8 3H5a2 2 0 0 0-2 2v3"/> <path d="M21 8V5a2 2 0 0 0-2-2h-3"/> <path d="M3 16v3a2 2 0 0 0 2 2h3"/> <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
    refresh:    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/> <path d="M21 3v5h-5"/> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/> <path d="M8 16H3v5"/>',
    send:       '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/> <path d="m21.854 2.147-10.94 10.939"/>',
    xcircle:    '<circle cx="12" cy="12" r="10"/> <path d="m15 9-6 6"/> <path d="m9 9 6 6"/>',
    checkcircle:'<circle cx="12" cy="12" r="10"/> <path d="m9 12 2 2 4-4"/>',
    chevron:    '<path d="m9 18 6-6-6-6"/>',
    more:       '<circle cx="12" cy="12" r="1"/> <circle cx="19" cy="12" r="1"/> <circle cx="5" cy="12" r="1"/>',
    inbox:      '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/> <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    play:       '<polygon points="6 3 20 12 6 21 6 3"/>',
    trophy:     '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/> <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/> <path d="M4 22h16"/> <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/> <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/> <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    crown:      '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/> <path d="M5 21h14"/>',
    leave:      '<path d="M16 19h6"/> <path d="M16 2v4"/> <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5"/> <path d="M3 10h18"/> <path d="M8 2v4"/>',
    history:    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/> <path d="M3 3v5h5"/> <path d="M12 7v5l4 2"/>',
    search:     '<circle cx="11" cy="11" r="8"/> <path d="m21 21-4.3-4.3"/>',
    hourglass:  '<path d="M5 22h14"/> <path d="M5 2h14"/> <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/> <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    shield:     '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/> <path d="m9 12 2 2 4-4"/>',
    phone:      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    eye:        '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/> <circle cx="12" cy="12" r="3"/>',
    login:      '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/> <polyline points="10 17 15 12 10 7"/> <line x1="15" x2="3" y1="12" y2="12"/>',
    logout:     '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/> <polyline points="16 17 21 12 16 7"/> <line x1="21" x2="9" y1="12" y2="12"/>',
    trash:      '<path d="M3 6h18"/> <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/> <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/> <line x1="10" x2="10" y1="11" y2="17"/> <line x1="14" x2="14" y1="11" y2="17"/>',
    chevrondown:'<path d="m6 9 6 6 6-6"/>',
    unlock:     '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/> <path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    save:       '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/> <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/> <path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    undo:       '<path d="M9 14 4 9l5-5"/> <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    coffee:     '<path d="M10 2v2"/> <path d="M14 2v2"/> <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/> <path d="M6 2v2"/>',
    stop:       '<rect width="18" height="18" x="3" y="3" rx="2"/>',
    up:         '<path d="m5 12 7-7 7 7"/> <path d="M12 19V5"/>',
    down:       '<path d="M12 5v14"/> <path d="m19 12-7 7-7-7"/>',
    alert:      '<circle cx="12" cy="12" r="10"/> <line x1="12" x2="12" y1="8" y2="12"/> <line x1="12" x2="12.01" y1="16" y2="16"/>',
    loading:    '<path d="M12 2v4"/> <path d="m16.2 7.8 2.9-2.9"/> <path d="M18 12h4"/> <path d="m16.2 16.2 2.9 2.9"/> <path d="M12 18v4"/> <path d="m4.9 19.1 2.9-2.9"/> <path d="M2 12h4"/> <path d="m4.9 4.9 2.9 2.9"/>',
    cancelleave:'<path d="M8 2v4"/> <path d="M16 2v4"/> <rect width="18" height="18" x="3" y="4" rx="2"/> <path d="M3 10h18"/> <path d="m14 14-4 4"/> <path d="m10 14 4 4"/>',
    external:   '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    roles:      '<path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/> <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/> <circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/>',
    automated:  '<path d="M10.268 21a2 2 0 0 0 3.464 0"/> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    sidebar:    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path class="side-chev" d="M16 10l-2 2 2 2"/>'
  };
  ICONS.quotas = ICONS.target;
  const ico = n => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;
  const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const NAV = [
    { group: "Server", items: [
      { id: "overview", label: "Overview", sub: "A quick look at how the server is doing." },
      { id: "players",  label: "Players",  sub: "Everyone currently in the server." },
      { id: "livemap",  label: "Live map", sub: "Live player positions." }
    ]},
    { group: "Moderation", items: [
      { id: "moderations", label: "Moderations", sub: "Warnings, kicks and other actions." },
      { id: "bans",        label: "Bans",        sub: "Active and past bans." },
      { id: "serverlogs",  label: "Server logs", sub: "Join, leave, and command logs." },
      { id: "commands",    label: "Commands",    sub: "Run commands on the server." },
      { id: "automated",   label: "Automated messages", sub: "Messages the panel posts in game on a timer." }
    ]},
    { group: "Team", items: [
      { id: "staff",  label: "Staff",  sub: "Your staff team." },
      { id: "shifts", label: "Shifts", sub: "Staff shift history." },
      { id: "quotas", label: "Quotas & leave", sub: "Weekly shift goals and time away." },
      { id: "roles", label: "Roles", sub: "Panel roles you can give staff. What each role can do is set in Settings." },
      { id: "settings", label: "Settings", sub: "Who can do what, and how the panel behaves." }
    ]}
  ];

  // Page renderers: add real UI here as we build each page.
  // Anything not listed falls back to the placeholder.
  // Overview data: replace with live values from your backend / ER:LC API later
  // DISCORD SIGN-IN: after the user signs in with Discord (OAuth) or the bot looks them up,
  // set these two. Avatar format: https://cdn.discordapp.com/avatars/<user_id>/<avatar_hash>.png
  // Filled from /api/me after Discord sign-in
  let USERNAME = "", USER_AVATAR = "", USER_ID = "", USER_PERMS = [];
  let ROLES = [];   // panel roles, highest first: { id, name, color }
  const applyConfig = c => {
    BLOCKED_COMMANDS.splice(0, BLOCKED_COMMANDS.length, ...c.blockedCommands);
    LOG_RETENTION_DAYS = c.logRetentionDays; COMMAND_RETENTION_DAYS = c.commandRetentionDays;
    MAX_STRIKES = c.maxStrikes; if (c.roles) ROLES = c.roles;
  };
  let SERVER_NAME = "";   // from ER:LC

  // All panel calls go through here. The X-Requested-With header is what backend.py checks on POSTs.
  const api = async (path, body) => {
    const r = await fetch(path, body === undefined ? { cache: "no-store" } : {
      method: "POST", headers: { "Content-Type": "application/json", "X-Requested-With": "panel" }, body: JSON.stringify(body) });
    if (r.status === 401) { location.href = "/login"; throw new Error("Sign in required."); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
    return d;
  };

  const STATS = [
    { label: "Players",      value: "–", note: "",                        icon: "players",   tint: "#9aa4b1" },
    { label: "In queue",     value: "–", note: "",                        icon: "hourglass", tint: "#22b8cf" },
    { label: "Staff in game",value: "–", note: "",                        icon: "shield",    tint: "#3ddc97" },
    { label: "Mod calls",    value: "–", note: "waiting for a moderator", icon: "phone",     tint: "#f5a623" },
    { label: "Logs today",   value: "–", note: "",                        icon: "moderations", tint: "#ef4444" },
    { label: "Ban BOLOs",    value: "–", note: "",                        icon: "eye",       tint: "#a855f7" }
  ];

  // ---------- Server logs data ----------
  // Newest first. type: "command" | "join" | "leave" | "kill" | "modcall"
  //   command: { user, cmd }   join/leave: { user }   kill: { user, target }   modcall: { user, text? }   all: { at: ms timestamp }
  // ER:LC only keeps recent logs, so your backend should store them as it polls and serve them from your own database.
  let LOG_RETENTION_DAYS = 14;       // these four are replaced by the server's settings on load
  let COMMAND_RETENTION_DAYS = 30;
  const LOGS_ENDPOINT = "/api/logs";
  const LOGS_POLL_MS = 10000;
  const SERVER_LOGS = [];
  // Staff currently clocked in: { name, avatar, started, onBreak, breakStartedAt, breakMs }  (the Shifts page manages this)
  const ACTIVE_SHIFTS = [];
  const MODERATIONS = [];  // newest first: { id, type, user, reason, evidence, duration, mod, modAvatar, status, at }
  const MOD_CALLS   = [];  // { user, id, at }

  // Players data: filled from /api/state and /api/players
  let MAX_PLAYERS = 0;
  const PLAYERS = [];
  const TEAM_COLORS = { Civilian: "#6b6e75", Police: "#3b82f6", Sheriff: "#3ddc97", Fire: "#ef4444", DOT: "#f5a623", Jail: "#c08457" };
  // keys are the Permission values ER:LC sends
  const PERM_COLORS = { "Server Owner": "#e6ebf0", "Server Co-Owner": "#8b5cf6", "Server Administrator": "#ef4444", "Server Moderator": "#f5a623", "Server Helper": "#22b8cf" };
  const isStaff = p => !!PERM_COLORS[p.permission];

  // Moderation types (labels, colors, descriptions come from your UI)
  const MOD_TYPES = [
    { id: "warning", label: "Warning",  color: "#f5a623", icon: "warn",      desc: "A formal warning on their record", verb: "warned",                 cta: "Log warning" },
    { id: "kick",    label: "Kick",     color: "#f97316", icon: "logout",    desc: "Removed from the server",          verb: "kicked",                 cta: "Log kick" },
    { id: "ban",     label: "Ban",      color: "#ef4444", icon: "bans",      desc: "Banned until staff unban them",        verb: "banned",                 cta: "Log ban" },
    { id: "tempban", label: "Temp ban", color: "#f43f5e", icon: "stopwatch", desc: "Banned for a set time",            verb: "temp banned",            cta: "Log temp ban" },
    { id: "bolo",    label: "Ban BOLO", color: "#a855f7", icon: "eye",       desc: "Ban them as soon as they are back in game", verb: "added a ban BOLO for", cta: "Log ban BOLO" },
    { id: "note",    label: "Note",     color: "#8b8f98", icon: "note",      desc: "A private note for staff",         verb: "added a note on",        cta: "Log note" }
  ];
  const typeById = id => MOD_TYPES.find(t => t.id === id) || MOD_TYPES[0];

  const avatarHtml = (name, url, cls = "") => {
    const safe = /^https:\/\//i.test(url || "");
    return `<span class="mavatar ${cls}" ${safe ? `style="background-image:url('${esc(url)}')"` : ""}>${safe ? "" : esc((name || "?").slice(0, 2).toUpperCase())}</span>`;
  };

  const timeAgo = at => {
    const s = Math.max(0, Math.floor((Date.now() - at) / 1000));
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  };

  // In-page replacements for alert/confirm/prompt.
  const toast = msg => {
    document.querySelector(".toast")?.remove();
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "alert"); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 6000);
  };
  // Resolves to true (no input), the typed text (input set), or null when cancelled.
  const ask = ({ title, text = "", ok = "OK", no = "Cancel", danger = false, input = null }) => new Promise(resolve => {
    const opener = document.activeElement;
    const back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = `
      <div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="askTitle">
        <div class="modal-head"><div><h2 id="askTitle">${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ""}</div></div>
        ${input === null ? "" : `<div class="modal-body"><label class="field"><input id="askInput" type="text" autocomplete="off" value="${esc(input)}" aria-labelledby="askTitle"></label></div>`}
        <div class="modal-foot">
          <button class="btn-ghost" type="button" data-a="no">${esc(no)}</button>
          <button class="${danger ? "btn-danger" : "btn-primary"}" type="button" data-a="yes">${ico(danger ? "alert" : "check")}${esc(ok)}</button>
        </div>
      </div>`;
    document.body.appendChild(back);
    const field = back.querySelector("#askInput");
    const done = v => {
      window.removeEventListener("keydown", onKey, true);
      back.remove();
      if (opener && opener.isConnected && opener.focus) opener.focus();
      resolve(v);
    };
    // capture on window so a dialog underneath doesn't also react to Escape/Tab
    const onKey = e => {
      if (e.key === "Escape") { e.stopPropagation(); done(null); }
      else if (e.key === "Enter" && field) { e.preventDefault(); done(field.value); }
      else if (e.key === "Tab") {
        e.stopPropagation();
        const f = [...back.querySelectorAll("button, input")], first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey, true);
    back.addEventListener("mousedown", e => { if (e.target === back) done(null); });
    back.addEventListener("click", e => {
      const a = e.target.closest("[data-a]")?.dataset.a;
      if (a) done(a === "no" ? null : field ? field.value : true);
    });
    (field || back.querySelector("[data-a=yes]")).focus();
  });

  // Opens the "New moderation log" dialog. onSaved(entry) runs after Log is clicked.
  function openLogModal(onSaved, initialType, player) {
    const types = MOD_TYPES.filter(t => USER_PERMS.includes("log." + t.id));
    if (!types.length) return toast("Your roles can't log moderations.");
    let type = types.find(t => t.id === initialType) || types[0];
    const opener = document.activeElement;
    const back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <div class="modal-head">
          <div><h2 id="mTitle">New moderation log</h2><p>This goes on the player's record.</p></div>
          <button class="x" id="mClose" type="button" aria-label="Close">${ico("close")}</button>
        </div>
        <div class="modal-body">
          <div class="types" id="mTypes"></div>
          <label class="field"><span>Player <em>*</em></span>
            <input id="mPlayer" type="text" placeholder="Roblox username…" autocomplete="off" list="mPlayerList">
            <datalist id="mPlayerList">${PLAYERS.map(p => `<option value="${esc(p.name)}"></option>`).join("")}</datalist>
            <small>Pick someone in game or type a Roblox username.</small>
          </label>
          <label class="field" id="mDurWrap" hidden><span>Duration <em>*</em></span>
            <input id="mDur" type="text" placeholder="e.g. 3 days" autocomplete="off">
          </label>
          <label class="field"><span>Reason <em>*</em></span>
            <textarea id="mReason" placeholder="What happened, and which rule it broke…"></textarea>
          </label>
          <label class="field"><span>Evidence</span>
            <input id="mEvidence" type="text" placeholder="https://medal.tv/…" autocomplete="off">
            <small>A link to a clip or screenshot (optional).</small>
          </label>
          <label class="pm" id="mPmWrap">
            <span class="pm-icon">${ico("bolt")}</span>
            <span class="pm-text"><span id="mPmTitle"></span><small>Runs through your ER:LC server key.</small></span>
            <span class="switch"><input type="checkbox" id="mPm" checked><i></i></span>
          </label>
        </div>
        <div class="modal-foot">
          <button class="btn-ghost" id="mCancel" type="button">Cancel</button>
          <button class="btn-primary" id="mSubmit" type="button" disabled>Log warning</button>
        </div>
      </div>`;
    document.body.appendChild(back);

    const $ = id => back.querySelector("#" + id);
    const typesEl = $("mTypes");

    const valid = () => $("mPlayer").value.trim() && $("mReason").value.trim() && (type.id !== "tempban" || $("mDur").value.trim());
    const refresh = () => {
      typesEl.innerHTML = types.map(t => `
        <button type="button" class="type-card ${t.id === type.id ? "sel" : ""}" data-t="${t.id}" style="--c:${t.color}" aria-pressed="${t.id === type.id}">
          <span class="tt">${ico(t.icon)}${t.label}</span><span class="td">${t.desc}</span>
        </button>`).join("");
      $("mDurWrap").hidden = type.id !== "tempban";
      const pmOk = type.id === "warning" || type.id === "kick";
      $("mPmWrap").hidden = !pmOk;
      $("mPmTitle").textContent = type.id === "kick" ? "Send them the kick reason as an in-game PM" : "Send them the warning as an in-game PM";
      $("mSubmit").innerHTML = ico(type.icon) + esc(type.cta);
      $("mSubmit").disabled = !valid();
    };

    const close = () => {
      document.removeEventListener("keydown", onKey);
      back.remove();
      if (opener && opener.focus) opener.focus();
    };
    const onKey = e => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = [...back.querySelectorAll("button:not(:disabled), input, textarea")].filter(el => el.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);

    typesEl.addEventListener("click", e => {
      const b = e.target.closest(".type-card");
      if (b) { type = typeById(b.dataset.t); refresh(); }
    });
    back.addEventListener("input", () => { $("mSubmit").disabled = !valid(); });
    back.addEventListener("mousedown", e => { if (e.target === back) close(); });
    $("mClose").onclick = close;
    $("mCancel").onclick = close;
    $("mSubmit").onclick = async () => {
      if (!valid()) return;
      $("mSubmit").disabled = true;
      let d;
      try {
        d = await api("/api/moderations", {
          type: type.id,
          user: $("mPlayer").value.trim(),
          reason: $("mReason").value.trim(),
          evidence: $("mEvidence").value.trim(),
          duration: type.id === "tempban" ? $("mDur").value.trim() : "",
          pm: !$("mPmWrap").hidden && $("mPm").checked
        });
      } catch (err) {
        toast(err.message);
        $("mSubmit").disabled = false;
        return;
      }
      MODERATIONS.unshift(d.entry);
      close();
      if (d.erlc.sent && !d.erlc.ok) toast("Logged, but ER:LC refused the command: " + d.erlc.error);
      if (onSaved) onSaved(d.entry);
    };

    if (player) $("mPlayer").value = player;
    refresh();
    $(player ? "mReason" : "mPlayer").focus();
  }

  // Roblox headshot over the initials; if the picture fails, the document-wide error handler below removes it.
  const robloxAvatar = (name, id, cls = "") => `<span class="avatar ${cls}">${esc((name || "?").slice(0, 2).toUpperCase())}${
    /^\d+$/.test(id || "") ? `<img src="/api/roblox/avatar/${id}?headshot=1" alt="" loading="lazy">` : ""}</span>`;
  document.addEventListener("error", e => { if (e.target.tagName === "IMG" && e.target.parentElement?.classList.contains("avatar")) e.target.remove(); }, true);

  // Player overview drawer (Players page). Shows the snapshot from when it was opened.
  function openPlayerProfile(p) {
    let tab = "record";
    const opener = document.activeElement;
    const record = () => MODERATIONS.filter(m => m.user.toLowerCase() === p.name.toLowerCase());
    const activity = () => SERVER_LOGS.filter(l => l.user === p.name || l.target === p.name).slice(0, 100);
    const joined = SERVER_LOGS.find(l => l.type === "join" && l.user === p.name);
    const canLog = USER_PERMS.includes("moderations.view");
    const back = document.createElement("div");
    back.className = "drawer-back";
    back.innerHTML = `
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="ppName">
        <div class="pf-head">
          ${robloxAvatar(p.name, p.id, "xl")}
          <div class="pf-who">
            <h2 id="ppName">${esc(p.name)}</h2>
            <p>${esc(p.location || "Location unknown")}</p>
            <div class="pf-tags"><span class="team" style="--dot:${TEAM_COLORS[p.team] || "#6b6e75"}"><i></i>${esc(p.team)}</span>
              ${PERM_COLORS[p.permission] ? `<span class="badge" style="--c:${PERM_COLORS[p.permission]}">${esc(p.permission)}</span>` : ""}</div>
          </div>
          <button class="x" id="ppClose" type="button" aria-label="Close">${ico("close")}</button>
        </div>
        <div class="pf-stats">${[
          [p.callsign ? esc(p.callsign) : "\u2013", "Callsign"],
          [record().length, "Logs"],
          [joined ? esc(timeAgo(joined.at)) : "\u2013", "Joined"],
          [p.id ? `<span class="mono">${esc(p.id)}</span>` : "\u2013", "User ID"]
        ].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
        <div class="pp-actions">
          ${canLog ? `<button class="btn-primary" id="ppLog" type="button">${ico("plus")}New log</button>` : ""}
          ${/^\d+$/.test(p.id) ? `<a class="btn-ghost btn-sm" href="https://www.roblox.com/users/${p.id}/profile" target="_blank" rel="noopener noreferrer">Roblox profile</a>` : ""}
        </div>
        <div class="pf-body">
          <div class="seg" id="ppTabs" role="tablist"></div>
          <div id="ppList"></div>
        </div>
      </aside>`;
    document.body.appendChild(back);
    const $ = id => back.querySelector("#" + id);

    const draw = () => {
      const rec = record(), act = activity();
      $("ppTabs").innerHTML = [["record", "moderations", "Record", rec.length], ["activity", "serverlogs", "Activity", act.length]]
        .map(([id, icon, label, n]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? "active" : ""}" data-t="${id}">${ico(icon)}${label} <span class="n">${n}</span></button>`).join("");
      if (tab === "record") {
        $("ppList").innerHTML = rec.length ? rec.map(m => { const t = typeById(m.type); return `
          <div class="pf-row"><i class="pf-dot" style="background:${t.color}"></i><div class="pf-main">
            <b>${esc(t.label)}${m.duration ? ` <span class="pp-dur">${esc(m.duration)}</span>` : ""}</b>
            <span class="pp-reason">${esc(m.reason)}${/^https?:\/\//i.test(m.evidence) ? ` <a href="${esc(m.evidence)}" target="_blank" rel="noopener noreferrer">Evidence</a>` : ""}</span>
            <small>by ${esc(m.mod)} \u00B7 ${esc(timeAgo(m.at))}</small></div></div>`; }).join("")
          : empty("moderations", "Nothing on their record");
      } else {
        $("ppList").innerHTML = act.length ? `<div class="pp-feed">${act.map(l => logRow(l, true)).join("")}</div>`
          : empty("serverlogs", USER_PERMS.includes("logs.view") ? "No logged activity yet" : "You can't see server logs");
      }
    };

    back.addEventListener("click", e => {
      const t = e.target.closest("[data-t]"); if (t) { tab = t.dataset.t; draw(); return; }
      if (e.target.closest("#ppLog")) openLogModal(() => { tab = "record"; draw(); }, null, p.name);
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      back.remove();
      if (opener && opener.isConnected && opener.focus) opener.focus();
    };
    const onKey = e => {
      if (document.querySelector(".modal-back")) return;   // the log window is open on top
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = [...back.querySelectorAll("button:not(:disabled), a[href]")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    back.addEventListener("mousedown", e => { if (e.target === back) close(); });
    $("ppClose").onclick = close;
    $("ppClose").focus();
    draw();
  }

  // Moderation log overview (Moderations page). onDeleted runs after the log is deleted.
  function openLogDetail(m, onDeleted) {
    const opener = document.activeElement, t = typeById(m.type);
    const canDelete = USER_PERMS.includes("moderations.delete");
    // show "medal.tv/clip/…" instead of the whole link; the full link is in the tooltip
    let evidence = "";
    if (/^https?:\/\//i.test(m.evidence)) {
      let short = m.evidence;
      try { const u = new URL(m.evidence); short = u.host.replace(/^www\./, "") + u.pathname.replace(/\/$/, ""); } catch {}
      evidence = `<a class="ld-link" href="${esc(m.evidence)}" target="_blank" rel="noopener noreferrer" title="${esc(m.evidence)}"><span>${esc(short)}</span>${ico("external")}</a>`;
    }
    const when = new Date(m.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    const back = document.createElement("div");
    back.className = "drawer-back";
    back.innerHTML = `
      <aside class="drawer ld" role="dialog" aria-modal="true" aria-labelledby="ldTitle" style="--c:${t.color}">
        <div class="ld-head">
          <div class="ld-meta"><span class="logbadge">${ico(t.icon)}${t.label}</span><span class="logid" translate="no">${esc(m.id)}</span></div>
          <button class="x" id="ldClose" type="button" aria-label="Close">${ico("close")}</button>
        </div>
        <div class="ld-who">
          <span class="avatar xl">${esc(m.user.slice(0, 2).toUpperCase())}<img src="/api/roblox/name/${encodeURIComponent(m.user)}/avatar?headshot=1" alt="" width="56" height="56"></span>
          <h2 class="ld-title" id="ldTitle" translate="no">${esc(m.user)}</h2>
        </div>
        <blockquote class="ld-reason">${esc(m.reason)}</blockquote>
        <dl class="ld-list">
          ${m.duration ? `<dt>Duration</dt><dd>${esc(m.duration)}</dd>` : ""}
          ${evidence ? `<dt>Evidence</dt><dd>${evidence}</dd>` : ""}
          <dt>Moderator</dt><dd><span class="mod">${avatarHtml(m.mod, m.modAvatar)}${esc(m.mod)}</span></dd>
          <dt>Logged</dt><dd><time datetime="${new Date(m.at).toISOString()}">${esc(when)}</time> <span class="ld-ago">${esc(timeAgo(m.at))}</span></dd>
          ${m.status && m.status !== "Logged" ? `<dt>Status</dt><dd><span class="status">${esc(m.status)}</span></dd>` : ""}
        </dl>
        ${canDelete ? `<div class="ld-foot"><button class="btn-danger" id="ldDelete" type="button">${ico("trash")}Delete log</button></div>` : ""}
      </aside>`;
    document.body.appendChild(back);
    const $ = id => back.querySelector("#" + id);

    const close = () => {
      document.removeEventListener("keydown", onKey);
      back.remove();
      if (opener && opener.isConnected && opener.focus) opener.focus();
    };
    const onKey = e => {
      if (document.querySelector(".modal-back")) return;   // the confirm dialog is open on top
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = [...back.querySelectorAll("button:not(:disabled), a[href]")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    back.addEventListener("mousedown", e => { if (e.target === back) close(); });
    $("ldClose").onclick = close;
    if (canDelete) $("ldDelete").onclick = async () => {
      if (!await ask({ title: `Delete ${m.id}?`, text: "It's removed from the record for everyone. This doesn't undo anything in game.", ok: "Delete log", danger: true })) return;
      const btn = $("ldDelete");
      btn.disabled = true; btn.lastChild.textContent = "Deleting…";
      try { await api(`/api/moderations/${encodeURIComponent(m.id)}/delete`, {}); }
      catch (err) { toast(`Couldn't delete ${m.id}: ${err.message}`); btn.disabled = false; btn.lastChild.textContent = "Delete log"; return; }
      const i = MODERATIONS.findIndex(x => x.id === m.id);
      if (i >= 0) MODERATIONS.splice(i, 1);
      close();
      if (onDeleted) onDeleted();
    };
    $("ldClose").focus();
  }

  const roleBadges = m => m.roles.length
    ? m.roles.map(id => ROLES.find(r => r.id === id)).filter(Boolean).map(r => `<span class="rankbadge" style="--c:${esc(r.color)}">${esc(r.name)}</span>`).join("")
    : `<span class="rankbadge" style="--c:${esc(m.rankColor)}">${esc(m.rank)}</span>`;

  // Pick a staff member's roles. Roles the viewer can't hand out are shown but locked. onDone runs with the fresh staff list.
  function editRoles(m, onDone) {
    if (!ROLES.length) return toast("There are no roles yet. Create one on the Roles page.");
    openForm(`Roles for ${esc(m.name)}`, "They get everything their roles allow.", `
      <div class="role-pick">${ROLES.map(r => {
        const can = m.assignable.includes(r.id);
        return `<label class="role-opt ${can ? "" : "locked"}" style="--c:${esc(r.color)}">
          <input type="checkbox" value="${r.id}" ${m.roles.includes(r.id) ? "checked" : ""} ${can ? "" : "disabled"}>
          <i></i><span>${esc(r.name)}</span>${can ? "" : `<small>Above your role</small>`}</label>`;
      }).join("")}</div>`,
      "Save roles", async f => {
        const roles = [...f.querySelectorAll(".role-pick input:checked")].map(i => +i.value);
        STAFF.splice(0, STAFF.length, ...await api(`/api/staff/${encodeURIComponent(m.id)}/roles`, { roles }));
        if (onDone) onDone();
      });
  }

  // Staff profile drawer. onChange runs after shift edits so the staff table can redraw.
  function openStaffProfile(m, onChange) {
    let tab = "history", data = null;
    const opener = document.activeElement;
    const back = document.createElement("div");
    back.className = "drawer-back";
    back.innerHTML = `
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="pfName">
        <div class="pf-head">
          ${avatarHtml(m.name, m.avatar, "xl")}
          <div class="pf-who">
            <h2 id="pfName">${esc(m.name)}</h2>
            <p>@${esc(m.handle || "")} · ${esc(m.rank)}${SERVER_NAME ? " in " + esc(SERVER_NAME) : ""}</p>
            <div class="pf-tags" id="pfTags"></div>
          </div>
          <button class="x" id="pfClose" type="button" aria-label="Close">${ico("close")}</button>
        </div>
        <div class="pf-stats" id="pfStats"></div>
        <div class="pf-body">
          <div class="seg" id="pfTabs" role="tablist"></div>
          <div id="pfList">${empty("loading", "Loading…")}</div>
        </div>
      </aside>`;
    document.body.appendChild(back);
    const $ = id => back.querySelector("#" + id);

    const drawTags = () => {
      $("pfTags").innerHTML = roleBadges(m) + (isOnShift(m.name) ? '<span class="onshift">On shift</span>' : '<span class="pf-off">Off shift</span>') +
        (m.assignable.length ? `<button class="btn-ghost btn-sm" id="pfRoles" type="button">${ico("roles")}Edit roles</button>` : "");
    };
    drawTags();
    const secsOf = sh => sh.ended == null ? activeSeconds(sh) : doneSeconds(sh);
    const draw = () => {
      const since = Date.now() - 7 * 864e5;
      const week = data ? data.shifts.filter(x => x.ended == null || x.ended >= since).reduce((t, x) => t + secsOf(x), 0) : 0;
      $("pfStats").innerHTML = [
        [data ? fmtDur(week) : "–", "This week"],
        [data ? data.logs7d : "–", "Logs (7d)"],
        [`<span class="strikes" role="img" aria-label="${m.strikes} of ${MAX_STRIKES} strikes">${Array.from({ length: MAX_STRIKES }, (_, i) => `<i class="${i < m.strikes ? "on" : ""}"></i>`).join("")}</span>`, "Strikes"],
        [esc(new Date(m.since).toLocaleDateString()), "Staff since"]
      ].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");
      if (!data) return;
      $("pfTabs").innerHTML = [["history", "history", "History", data.history.length], ["shifts", "shifts", "Shifts", data.shifts.length]]
        .map(([id, icon, label, n]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? "active" : ""}" data-t="${id}">${ico(icon)}${label} <span class="n">${n}</span></button>`).join("");
      if (tab === "history") {
        $("pfList").innerHTML = data.history.length ? data.history.map(h => `
          <div class="pf-row"><i class="pf-dot"></i><div class="pf-main"><b>${esc(h.text)}</b><small>by ${esc(h.by)} · ${esc(fmtDateTime(h.at))}</small></div></div>`).join("")
          : empty("moderations", "Nothing on their record");
        return;
      }
      const btn = (act, id, icon, label) => `<button class="dots-btn" type="button" data-act="${act}" data-id="${id}" aria-label="${label}" title="${label}">${ico(icon)}</button>`;
      $("pfList").innerHTML = (data.canEdit ? `<div class="pf-tools"><button class="btn-ghost btn-sm" id="pfAddTime" type="button">${ico("shifts")}Add or remove time</button></div>` : "") +
        (data.shifts.length ? data.shifts.map(sh => {
          const live = sh.ended == null, secs = secsOf(sh);
          const title = sh.manual ? (sh.adjustMs >= 0 ? "Time added" : "Time removed") : esc(fmtDateTime(sh.started));
          const sub = live ? (sh.onBreak ? "On break" : "On shift now") : sh.manual ? esc(fmtDateTime(sh.ended)) : "Ended " + esc(fmtDateTime(sh.ended));
          const dur = sh.manual && !sh.revoked ? (sh.adjustMs < 0 ? "-" : "+") + fmtDur(Math.abs(sh.adjustMs) / 1000) : fmtDur(secs);
          const acts = !data.canEdit || live ? "" : sh.revoked ? btn("restore", sh.id, "refresh", "Restore shift")
            : (sh.manual ? "" : btn("set", sh.id, "pencil", "Edit length")) + btn("revoke", sh.id, "bans", "Revoke shift");
          return `<div class="pf-row ${sh.revoked ? "is-revoked" : live ? "is-live" : ""}"><i class="pf-dot"></i>
            <div class="pf-main"><b>${sh.revoked ? `<span class="struck">${title}</span><span class="revoked">Revoked</span>` : title}</b>
              <small>${sub}</small>${sh.revoked && sh.revokedBy ? `<small>${esc(sh.revokedBy)}</small>` : ""}</div>
            <span class="pf-dur">${dur}</span><span class="pf-acts">${acts}</span></div>`;
        }).join("") : empty("shifts", "No shifts yet"));
    };

    const load = async () => {
      try { data = await api("/api/staff/" + encodeURIComponent(m.id)); }
      catch (err) { $("pfList").innerHTML = empty("alert", esc(err.message)); return; }
      draw();
    };
    const change = async (path, body) => {
      try { await api(`/api/staff/${encodeURIComponent(m.id)}/${path}`, body); } catch (err) { toast(err.message); }
      await Promise.all([load(), loadState().catch(() => {})]);
      if (onChange) onChange();
    };

    back.addEventListener("click", e => {
      const t = e.target.closest("[data-t]"); if (t) { tab = t.dataset.t; draw(); return; }
      if (e.target.closest("#pfRoles")) {
        editRoles(m, () => { m = STAFF.find(x => x.id === m.id) || m; drawTags(); load(); if (onChange) onChange(); });
        return;
      }
      if (e.target.closest("#pfAddTime")) {
        ask({ title: "Add or remove time", text: "Minutes to add. Use a minus sign to remove (for example -30).", input: "", ok: "Save" })
          .then(v => { if (v && v.trim()) change("time", { minutes: v.trim() }); });
        return;
      }
      const b = e.target.closest("[data-act]"); if (!b) return;
      const sh = data.shifts.find(x => x.id === +b.dataset.id); if (!sh) return;
      if (b.dataset.act === "set") {
        ask({ title: "Edit shift length", text: "Shift length in minutes.", input: String(Math.round(doneSeconds(sh) / 60)), ok: "Save" })
          .then(v => { if (v && v.trim()) change("shifts/" + sh.id, { action: "set", minutes: v.trim() }); });
      } else change("shifts/" + sh.id, { action: b.dataset.act });
    });

    const close = () => {
      document.removeEventListener("keydown", onKey);
      back.remove();
      if (opener && opener.isConnected && opener.focus) opener.focus();
    };
    const onKey = e => {
      if (document.querySelector(".modal-back")) return;   // a dialog opened from the drawer handles its own keys
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = [...back.querySelectorAll("button:not(:disabled)")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    back.addEventListener("mousedown", e => { if (e.target === back) close(); });
    $("pfClose").onclick = close;
    $("pfClose").focus();
    draw();
    load();
  }

  // ---------- Live map config ----------
  // Best option: download the map image, put it next to this file / on your site, and point MAP_URL at your copy
  // (e.g. "/img/liberty-map.png"). Remote links can be blocked by previews or hotlink protection.
  const MAP_URL = "/img/map.png";
  const MAP_FALLBACKS = ["https://api.erlc.gg/maps/fall_postals.png"];
  // World-coordinate range the map image covers. Checked against a live player at postal 210. Fine-tune by turning on
  // SHOW_COORDS, hovering a spot you know (like a postal), and adjusting until the pins line up.
  const MAP_BOUNDS = { xMin: 0, xMax: 5355, zMin: 0, zMax: 5355 };   // 1 stud = 1 pixel on the 5355px official map
  const FLIP_Z = false;        // set true if pins look mirrored top-to-bottom
  const SHOW_COORDS = false;   // shows world X / Z under the cursor (for calibration)
  // Your backend route that returns the ER:LC v2 response (the browser can't call it directly, see notes).
  // Leave "" until it exists. e.g. "/api/erlc/players"
  const LIVE_ENDPOINT = "/api/players";
  const LIVE_POLL_MS = 5000;

  // Accepts the raw ER:LC v2 response ({ Players: [...] }) or a plain array.
  const normalizePlayers = raw => {
    const list = Array.isArray(raw) ? raw : (raw && (raw.Players || raw.players)) || [];
    return list.map(p => {
      const [name, id] = String(p.Player || p.name || "").split(":");
      const L = p.Location || {};
      return {
        name, id: id || p.id || "",
        team: p.Team || p.team || "Civilian",
        callsign: p.Callsign || p.callsign || "",
        permission: p.Permission || p.permission || "Normal",
        x: L.LocationX ?? p.x, z: L.LocationZ ?? p.z,
        street: L.StreetName || p.street || "", postal: L.PostalCode || p.postal || ""
      };
    }).filter(p => p.name);
  };

  // ---------- Bans data ----------
  // Your backend route that returns the ER:LC ban list. ER:LC's endpoint is GET https://api.erlc.gg/v1/server/bans
  // (server-key header) and answers with { "<userId>": "<username>", ... }. Leave "" until it exists.
  const BANS_ENDPOINT = "/api/bans";
  const BANS = [];            // { name, id }
  let bansCheckedAt = Date.now();
  const normalizeBans = raw => Array.isArray(raw)
    ? raw.map(b => ({ name: String(b.name || b.Name || ""), id: String(b.id || b.Id || "") })).filter(b => b.name || b.id)
    : Object.entries(raw || {}).map(([id, name]) => ({ id, name: String(name) }));

  const LOG_ICON = { command: "commands", join: "login", leave: "logout", kill: "target", modcall: "phone" };
  const logText = (l, mono) => {
    const u = `<b>${esc(l.user)}</b>`;
    switch (l.type) {
      case "command": return `${u} <span class="${mono ? "mono" : ""}">ran ${esc(l.cmd)}</span>`;
      case "join":    return `${u} joined the server`;
      case "leave":   return `${u} left the server`;
      case "kill":    return `${u} killed <b>${esc(l.target || "someone")}</b>`;
      case "modcall": return `${u} called a moderator${l.text ? " \u00B7 " + esc(l.text) : ""}`;
      default:        return `${u} ${esc(l.text || "")}`;
    }
  };
  const logRow = (l, mono) => `<div class="row"><span class="row-icon ${l.type}">${ico(LOG_ICON[l.type] || "pulse")}</span><span class="row-text">${logText(l, mono)}</span><span class="row-time">${esc(timeAgo(l.at))}</span></div>`;

  // ---------- Commands data ----------
  // Your backend route. The panel POSTs { "command": ":h Hello" } and expects { "ok": true } or { "ok": false, "error": "..." }.
  // The backend forwards it to ER:LC (POST https://api.erlc.gg/v2/server/command, server-key header).
  const COMMAND_ENDPOINT = "/api/commands";
  const COMMAND_COOLDOWN_MS = 5000;   // ER:LC allows one command every 5 seconds
  // ER:LC refuses commands that give out admin/mod powers or shut the server down. The backend must block these too.
  const BLOCKED_COMMANDS = [":admin", ":unadmin", ":mod", ":unmod", ":helper", ":unhelper", ":shutdown"];
  const QUICK_COMMANDS = [
    { title: "Server message", fill: ":m",     hint: ":m" },
    { title: "Hint",           fill: ":h",     hint: ":h" },
    { title: "Private message",fill: ":pm",    hint: ":pm username" },
    { title: "Kick",           fill: ":kick",  hint: ":kick username reason" },
    { title: "Ban",            fill: ":ban",   hint: ":ban username" },
    { title: "Unban",          fill: ":unban", hint: ":unban username" },
    { title: "Priority timer", fill: ":prty",  hint: ":prty 120" },
    { title: "Peace timer",    fill: ":pt",    hint: ":pt 120" }
  ];
  // newest first: { command, ok, error, user, at }
  const COMMAND_HISTORY = [];

  // ---------- Staff data ----------
  let MAX_STRIKES = 3;
  // { id, name, handle, avatar, rank, strikes, since, canManage }  (from /api/state)
  const STAFF = [];
  const fmtDur = s => { const sec = Math.max(0, s); return sec < 60 ? Math.floor(sec) + "s" : sec < 3600 ? Math.floor(sec / 60) + "m" : Math.floor(sec / 3600) + "h " + Math.floor((sec % 3600) / 60) + "m"; };

  // ---------- Shifts data ----------
  // Finished shifts, newest first: { user, avatar, started, ended, breakMs, revoked, logs }  (times are ms timestamps)
  // Time on break (breakMs) doesn't count, and a revoked shift counts as 0s. Your backend should own start/stop times.
  const SHIFTS = [];
  const setShifts = s => { ACTIVE_SHIFTS.splice(0, ACTIVE_SHIFTS.length, ...s.active); SHIFTS.splice(0, SHIFTS.length, ...s.finished); };
  const activeSeconds = a => Math.max(0, ((Date.now() - a.started) - a.breakMs - (a.onBreak ? Date.now() - a.breakStartedAt : 0)) / 1000);
  // manual rows are "add/remove time" entries, so they may be negative
  const doneSeconds = sh => sh.revoked ? 0 : sh.manual ? sh.adjustMs / 1000 : Math.max(0, (sh.ended - sh.started - sh.breakMs + (sh.adjustMs || 0)) / 1000);
  const isOnShift = name => ACTIVE_SHIFTS.some(a => a.name === name);
  const weekSecondsFor = name => {
    const since = Date.now() - 7 * 864e5;
    return SHIFTS.filter(x => x.user === name && x.ended >= since).reduce((t, x) => t + doneSeconds(x), 0)
         + ACTIVE_SHIFTS.filter(a => a.name === name).reduce((t, a) => t + activeSeconds(a), 0);
  };
  const fmtClock = sec => { const t = Math.floor(sec), z = n => String(n).padStart(2, "0"); return `${Math.floor(t / 3600)}:${z(Math.floor(t % 3600 / 60))}:${z(t % 60)}`; };
  const fmtDateTime = ms => new Date(ms).toLocaleString(undefined, { month: "2-digit", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }).replace(", ", " ");

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

  const panel = (title, icon, link, body, cls = "") => `
    <section class="panel ${cls}">
      <div class="panel-head">
        <span class="t">${ico(icon)}${title}</span>
        ${link ? `<a href="${link.href}">${link.text}</a>` : ""}
      </div>
      <div class="panel-body">${body}</div>
    </section>`;

  // Quota weeks run Monday 00:00 UTC to Monday 00:00 UTC, same as backend.py.
  const nextWeekStart = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7)); return d.getTime(); };
  const isoDay = ms => new Date(ms).toISOString().slice(0, 10);
  const fmtDay = iso => new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

  // Small dialog around a form. onSubmit(form) may throw; its message shows above the buttons.
  function openForm(title, sub, body, submitLabel, onSubmit) {
    const opener = document.activeElement;
    const back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = `
      <form class="modal" role="dialog" aria-modal="true" aria-labelledby="fTitle" novalidate>
        <div class="modal-head">
          <div><h2 id="fTitle">${title}</h2><p>${sub}</p></div>
          <button class="x" data-close type="button" aria-label="Close">${ico("close")}</button>
        </div>
        <div class="modal-body">${body}<p class="f-err" role="alert"></p></div>
        <div class="modal-foot">
          <button class="btn-ghost" data-close type="button">Cancel</button>
          <button class="btn-primary" type="submit">${ico("check")}${submitLabel}</button>
        </div>
      </form>`;
    document.body.appendChild(back);
    const form = back.querySelector("form");
    const close = () => {
      document.removeEventListener("keydown", onKey);
      back.remove();
      if (opener && opener.focus) opener.focus();
    };
    const onKey = e => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const f = [...back.querySelectorAll("button:not(:disabled), input, textarea, select")].filter(el => el.offsetParent);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    back.addEventListener("mousedown", e => { if (e.target === back) close(); });
    back.addEventListener("click", e => { if (e.target.closest("[data-close]")) close(); });
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]"); btn.disabled = true;
      try { await onSubmit(form); close(); }
      catch (err) { form.querySelector(".f-err").textContent = err.message; btn.disabled = false; }
    });
    form.querySelector(".modal-body input, .modal-body textarea").focus();
  }

  const empty = (icon, text, h) => `<div class="empty"${h ? ` style="min-height:${h}px"` : ""}>${ico(icon)}<span>${text}</span></div>`;

  const HEADINGS = {
    quotas: () => {
      const days = Math.ceil((nextWeekStart() - Date.now()) / 864e5);
      return { title: "Quotas &amp; leave",
        sub: `Weekly hours on shift. The week resets Monday 00:00 UTC, in ${days} ${days === 1 ? "day" : "days"}.`,
        tools: `<div class="q-tools"><button class="btn-ghost btn-sm" id="qReq" type="button">${ico("leave")}Request leave</button>${
          USER_PERMS.includes("settings.manage") ? `<button class="btn-ghost btn-sm" id="qSet" type="button">${ico("settings")}Settings</button>` : ""}</div>` };
    },
    roles: () => ({ title: "Roles",
      sub: "Roles higher on the list outrank the ones below. Set what each role can do in Settings.",
      tools: `<button class="btn-primary" id="roleNew" type="button">${ico("plus")}New role</button>` }),
    shifts: () => ({ title: "Shifts", sub: "Clock in while you moderate. Time on break doesn't count." }),
    settings: () => ({ title: "Settings", sub: "Only owners see this page. Changes apply to everyone right away." }),
    staff: () => ({ title: "Staff", sub: `${STAFF.length} on the staff team \u00B7 ${STAFF.filter(m => isOnShift(m.name)).length} on shift` }),
    commands: () => ({ title: "Commands", sub: "Run in-game commands on your ER:LC server. ER:LC takes one command every 5 seconds." }),
    automated: () => ({
      title: "Automated messages",
      sub: "Set up messages the panel posts in game on a timer.",
      tools: USER_PERMS.includes("automated.manage") ? `<button class="btn-primary" id="autoNew" type="button">${ico("plus")}Create message</button>` : ""
    }),
    serverlogs: () => ({
      title: "Server logs",
      sub: `Joins, leaves, kills, commands and mod calls from your ER:LC server. You can look back ${LOG_RETENTION_DAYS} days, or ${COMMAND_RETENTION_DAYS} for commands.`,
      tools: `<div class="tools-row"><label class="search">${ico("search")}<input id="logSearch" type="search" placeholder="Search a player or command…" autocomplete="off" aria-label="Search logs"></label>${
        USER_PERMS.includes("logs.clear") ? `<button class="btn-danger" id="logClear" type="button">${ico("trash")}Clear logs</button>` : ""}</div>`
    }),
    bans: () => ({
      title: "Bans",
      sub: `${BANS.length} banned on the ER:LC server \u00B7 checked ${timeAgo(bansCheckedAt)}`,
      tools: `<div class="tools-row">
        <label class="search">${ico("search")}<input id="banSearch" type="search" placeholder="Name or user ID…" autocomplete="off" aria-label="Search bans"></label>
        <button class="btn-ghost btn-sm" id="banRefresh" type="button">${ico("refresh")}Refresh</button>
        <button class="btn-danger" id="banAdd" type="button">${ico("bans")}Ban someone</button>
      </div>`
    }),
    livemap: () => ({ title: "Live map", sub: "", flush: true }),
    moderations: () => ({
      title: "Moderations",
      sub: "Warnings, kicks, bans, ban BOLOs and notes your staff have logged.",
      tools: `<button class="btn-primary" id="newLog" type="button">${ico("plus")}New log</button>`
    }),
    overview: () => ({ title: `${greeting()}, ${esc(USERNAME)}`, sub: esc(SERVER_NAME) }),
    players:  () => ({
      title: "Players",
      sub: `${PLAYERS.length} of ${MAX_PLAYERS} in game`,
      tools: `<label class="search">${ico("search")}<input id="playerSearch" type="search" placeholder="Search name or callsign…" autocomplete="off" aria-label="Search players"></label>`
    })
  };

  const PERM_LABELS = {
    "overview.view": "See the overview", "players.view": "See players", "livemap.view": "See the live map",
    "moderations.view": "See and log moderations", "bans.view": "See bans", "bans.remove": "Unban players", "logs.view": "See server logs", "logs.clear": "Clear server logs", "moderations.delete": "Delete moderation logs",
    "commands.run": "Run commands", "staff.view": "See the staff team", "staff.manage": "Manage staff (strikes, shifts, leave)",
    "shifts.use": "Clock in for shifts", "moderations.delete": "Delete moderation logs", "roles.assign": "Give staff roles",
    "settings.manage": "Change settings and roles",
    "automated.manage": "Manage automated messages"
  };
  const PERM_GROUPS = [
    ["Server", ["overview.view", "players.view", "livemap.view"]],
    ["Moderation", ["moderations.view", "moderations.delete", "bans.view", "bans.remove", "logs.view", "logs.clear", "commands.run", "automated.manage"]],
    ["Team", ["staff.view", "staff.manage", "roles.assign", "shifts.use", "settings.manage"]]
  ];

  // Runs after a page renders (wire up events here)
  const AFTER = {
    roles: () => {
      const list = document.getElementById("roleList"), tools = document.getElementById("headTools");
      let roles = [];
      const draw = () => {
        list.innerHTML = roles.length ? roles.map((r, i) => `
          <div class="role-row" style="--c:${esc(r.color)}">
            <i class="role-swatch"></i>
            <div class="role-main"><b>${esc(r.name)}</b><small>${r.members} ${r.members === 1 ? "person" : "people"} \u00B7 ${r.perms.length} ${r.perms.length === 1 ? "permission" : "permissions"}</small></div>
            <div class="role-acts">
              <button class="dots-btn" type="button" data-r="${r.id}" data-a="up" aria-label="Move ${esc(r.name)} up" title="Move up" ${i === 0 ? "disabled" : ""}>${ico("up")}</button>
              <button class="dots-btn" type="button" data-r="${r.id}" data-a="down" aria-label="Move ${esc(r.name)} down" title="Move down" ${i === roles.length - 1 ? "disabled" : ""}>${ico("down")}</button>
              <button class="dots-btn" type="button" data-r="${r.id}" data-a="edit" aria-label="Edit ${esc(r.name)}" title="Edit">${ico("pencil")}</button>
              <button class="dots-btn" type="button" data-r="${r.id}" data-a="delete" aria-label="Delete ${esc(r.name)}" title="Delete">${ico("trash")}</button>
            </div>
          </div>`).join("")
          : `<div class="q-empty">${ico("roles")}<b>No roles yet</b><span>Create a role, then tick what it can do in Settings.</span></div>`;
      };
      const set = list => { roles = list; ROLES = list.map(({ id, name, color }) => ({ id, name, color })); draw(); };
      const roleForm = (title, r, submit, path) => openForm(title, "Pick a name and color staff will see.", `
        <div class="q-pair role-fields">
          <label class="field"><span>Name <em>*</em></span><input name="name" maxlength="32" value="${esc(r ? r.name : "")}" placeholder="e.g. Senior Mod" autocomplete="off"></label>
          <label class="field"><span>Color</span><input name="color" type="color" value="${esc(r ? r.color : "#22b8cf")}"></label>
        </div>`, submit, async f => set(await api(path, { name: f.name.value, color: f.color.value })));

      const onTools = e => { if (e.target.closest("#roleNew")) roleForm("New role", null, "Create role", "/api/roles"); };
      tools.addEventListener("click", onTools);
      list.addEventListener("click", async e => {
        const b = e.target.closest("[data-a]"); if (!b) return;
        const r = roles.find(x => x.id === +b.dataset.r); if (!r) return;
        if (b.dataset.a === "edit") return roleForm(`Edit ${esc(r.name)}`, r, "Save role", "/api/roles/" + r.id);
        if (b.dataset.a === "delete" && !await ask({ title: `Delete ${r.name}?`,
          text: `${r.members} ${r.members === 1 ? "person loses" : "people lose"} this role and everything it allows. This can't be undone.`, ok: "Delete role", danger: true })) return;
        b.disabled = true;
        try { set(await api("/api/roles/" + r.id, { action: b.dataset.a })); } catch (err) { toast(err.message); b.disabled = false; }
      });
      api("/api/roles").then(set).catch(err => { list.innerHTML = empty("alert", esc(err.message), 160); });
      return () => tools.removeEventListener("click", onTools);
    },
    automated: () => {
      const list = document.getElementById("autoList"), tools = document.getElementById("headTools");
      const canEdit = USER_PERMS.includes("automated.manage");
      const TYPES = { hint: "Hint", announcement: "Announcement" };
      let items = [];
      const every = m => fmtDur(m * 60).replace(/ 0m$/, "");

      const draw = () => {
        list.innerHTML = items.length ? items.map(a => `
          <section class="panel auto-card">
            <div class="panel-head"><span class="t">${esc(a.name)}</span></div>
            <div class="auto-body">
              <div class="auto-line"><span>Interval:</span><b>${esc(every(a.interval))}</b></div>
              <div class="auto-line col"><span>Message:</span><p class="auto-msg">${esc(a.message)}</p></div>
              <div class="auto-line"><span>ER:LC:</span><b>${esc(TYPES[a.type] || a.type)}</b></div>
              ${a.minPlayers > 0 ? `<div class="auto-line"><span>Min players:</span><b>${a.minPlayers}</b></div>` : ""}
              ${a.erlc ? "" : `<div class="auto-line"><span>Status:</span><b>Not posting</b></div>`}
            </div>
            ${canEdit ? `<div class="auto-acts">
              <button class="dots-btn" type="button" data-a="edit" data-id="${a.id}" aria-label="Edit ${esc(a.name)}" title="Edit">${ico("pencil")}</button>
              <button class="dots-btn" type="button" data-a="delete" data-id="${a.id}" aria-label="Delete ${esc(a.name)}" title="Delete">${ico("trash")}</button>
            </div>` : ""}
          </section>`).join("")
          : `<div class="q-empty">${ico("automated")}<b>No automated messages yet</b><span>Create one and it posts in game on a timer.</span></div>`;
      };
      const set = l => { items = l; draw(); };

      // same form for create and edit
      const messageForm = (title, a, submit, path) => openForm(title, "Pick how often it posts and what it says.", `
        <label class="field"><span>Name <em>*</em></span>
          <input name="name" maxlength="40" value="${esc(a ? a.name : "")}" placeholder="e.g. VC Reminder" autocomplete="off"></label>
        <label class="field"><span>Interval (minutes) <em>*</em></span>
          <input name="interval" type="number" min="5" step="1" value="${a ? a.interval : ""}" autocomplete="off">
          <small>How often should we send the message? The minimum interval is 5 minutes.</small></label>
        <label class="field"><span>Message</span>
          <textarea name="message" maxlength="300">${esc(a ? a.message : "")}</textarea></label>
        <label class="pm"><span class="pm-text">Post message in ER:LC<small>Should the panel send this message in game</small></span>
          <span class="switch"><input type="checkbox" name="erlc" ${!a || a.erlc ? "checked" : ""}><i></i></span></label>
        <label class="field"><span>ER:LC Type <em>*</em></span>
          <select name="type">${Object.entries(TYPES).map(([k, l]) => `<option value="${k}" ${a && a.type === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="field"><span>Minimum ER:LC Players</span>
          <input name="minPlayers" type="number" min="0" step="1" value="${a ? a.minPlayers : 0}" autocomplete="off">
          <small>The minimum number of players required in the ER:LC server for this message to run. Set to 0 to always run.</small></label>`,
        submit, async f => {
          const el = f.elements;
          const body = {
            name: el.name.value.trim(), interval: Math.floor(+el.interval.value), message: el.message.value.trim(),
            erlc: el.erlc.checked, type: el.type.value, minPlayers: Math.max(0, Math.floor(+el.minPlayers.value || 0))
          };
          if (!body.name) throw new Error("Give it a name.");
          if (!(body.interval >= 5)) throw new Error("The interval must be at least 5 minutes.");
          if (!body.message) throw new Error("Write the message to send.");
          set(await api(path, body));
        });

      const onTools = e => { if (e.target.closest("#autoNew")) messageForm("Create message", null, "Create message", "/api/automated"); };
      tools.addEventListener("click", onTools);
      list.addEventListener("click", async e => {
        const b = e.target.closest("[data-a]"); if (!b) return;
        const a = items.find(x => x.id === +b.dataset.id); if (!a) return;
        if (b.dataset.a === "edit") return messageForm(`Edit ${esc(a.name)}`, a, "Save message", "/api/automated/" + a.id);
        if (!await ask({ title: `Delete ${a.name}?`, text: "It stops posting in game. This can't be undone.", ok: "Delete message", danger: true })) return;
        b.disabled = true;
        try { set(await api(`/api/automated/${a.id}/delete`, {})); } catch (err) { toast(err.message); b.disabled = false; }
      });
      api("/api/automated").then(set).catch(err => { list.innerHTML = empty("alert", esc(err.message), 160); });
      return () => tools.removeEventListener("click", onTools);
    },
    quotas: () => {
      const $ = id => document.getElementById(id);
      const tools = $("headTools");
      let data = null;
      const fmtH = s => fmtDur(s).replace(/ 0m$/, "");
      const pct = r => r.goal ? Math.min(100, r.secs / r.goal * 100).toFixed(1) : 0;
      const STATUS = { met: ["Met", "#22c55e"], behind: ["Behind", "#f5a623"], leave: ["On leave", "#22b8cf"], none: ["No quota", "#858585"] };
      const LEAVE = { pending: ["Waiting", "#f5a623"], approved: ["Approved", "#22c55e"], denied: ["Denied", "#ef4444"] };
      // bar color: status when there's a goal, otherwise the person's rank color
      const barColor = r => r.status === "none" ? r.rankColor : STATUS[r.status][1];
      const badge = ([label, c]) => `<span class="badge" style="--c:${c}">${label}</span>`;
      const span = (a, b) => a === b ? fmtDay(a) : `${fmtDay(a)} to ${fmtDay(b)}`;

      const draw = () => {
        const d = data, me = d.week.find(r => r.id === USER_ID);
        $("qBanner").innerHTML = !d.enabled
          ? `<div class="q-banner">Quotas are off. ${USER_PERMS.includes("settings.manage") ? "Turn them on in Settings: the" : "Someone who manages settings can turn them on. The"} first week checked is the next full one. Leave requests still work.</div>`
          : d.since > Date.now() ? `<div class="q-banner">Quotas start ${fmtDay(isoDay(d.since))}. This week isn't checked.</div>` : "";
        $("qMine").innerHTML = !me ? `<p class="q-note">You're not on the staff list.</p>` : `
          <div class="q-big" style="--c:${barColor(me)}">${fmtH(me.secs)}</div>
          <div class="lb-bar q-bar" style="--c:${barColor(me)}"><i style="width:${pct(me)}%"></i></div>
          <p class="q-note">${!d.enabled ? "Quotas are off."
            : me.status === "none" ? "Your rank has no weekly goal."
            : me.status === "leave" ? "You're on leave all week."
            : me.status === "met" ? `Goal of ${fmtH(me.goal)} met.`
            : `${fmtH(me.goal - me.secs)} left of ${fmtH(me.goal)}.`}${me.leaveDays && me.status !== "leave" ? ` Lowered for ${me.leaveDays} ${me.leaveDays === 1 ? "day" : "days"} of leave.` : ""}</p>`;
        const met = d.week.filter(r => r.status === "met").length;
        $("qMet").textContent = `${met} met`;
        $("qMet").classList.toggle("good", met > 0);
        // most time first; the sort is stable, so ties keep the server's rank order
        const top = Math.max(1, ...d.week.map(r => r.secs));
        $("qWeek").innerHTML = d.week.length ? [...d.week].sort((a, b) => b.secs - a.secs).map((r, i) => `
          <div class="q-row ${i === 0 && r.secs > 0 ? "lead" : ""}">
            <span class="lb-rank">${i === 0 && r.secs > 0 ? ico("crown") : i + 1}</span>
            ${avatarHtml(r.name, r.avatar, "lg")}
            <div class="q-who"><b>${esc(r.name)}</b><span style="color:${esc(r.rankColor)}">${esc(r.rank)}</span></div>
            <div class="lb-bar q-bar" style="--c:${barColor(r)}"><i style="width:${r.goal ? pct(r) : (r.secs / top * 100).toFixed(1)}%"></i></div>
            <span class="q-time">${fmtH(r.secs)}${r.goal ? `<span>/${fmtH(r.goal)}</span>` : ""}</span>
            ${badge(STATUS[r.status])}
          </div>`).join("") : empty("staff", "No staff found", 120);
        $("qLeave").innerHTML = d.leave.length ? d.leave.map(l => `
          <div class="q-leave">
            ${avatarHtml(l.name, l.avatar, "lg")}
            <div class="q-who"><b>${l.mine ? "You" : esc(l.name)} ${badge(LEAVE[l.status])}</b><span>${span(l.start, l.end)}</span><span title="${esc(l.reason)}">${esc(l.reason)}</span></div>
            <div class="q-acts">
              ${l.canDecide ? `<button class="btn-ghost btn-sm" data-leave="${l.id}" data-a="approve" type="button">${ico("check")}Approve</button><button class="btn-ghost btn-sm" data-leave="${l.id}" data-a="deny" type="button">${ico("close")}Deny</button>` : ""}
              ${l.mine ? `<button class="btn-ghost btn-sm" data-leave="${l.id}" data-a="cancel" type="button">${ico("cancelleave")}Cancel</button>` : ""}
            </div>
          </div>`).join("") : empty("leave", "No leave coming up", 120);
        $("qPast").innerHTML = d.past.length ? d.past.map(p => `
          <div class="q-past"><b>Week of ${fmtDay(isoDay(p.start))}</b><span class="${p.total && p.met === p.total ? "good" : p.missed.length ? "warn" : ""}">${p.met} of ${p.total} met</span>
            ${p.missed.length ? `<small>Missed: ${p.missed.map(esc).join(", ")}</small>` : ""}</div>`).join("")
          : `<div class="q-empty">${ico("history")}<b>No finished weeks yet</b><span>Each week is checked when it ends.</span></div>`;
      };
      const load = () => api("/api/quotas").then(x => { data = x; draw(); })
        .catch(err => { $("qWeek").innerHTML = `<div class="placeholder">${esc(err.message)}</div>`; });

      const requestLeave = () => {
        const today = isoDay(Date.now());
        openForm("Request leave", "An admin reviews it. Approved days lower your weekly goal.", `
          <div class="q-pair">
            <label class="field"><span>First day <em>*</em></span><input name="start" type="date" min="${today}" value="${today}"></label>
            <label class="field"><span>Last day <em>*</em></span><input name="end" type="date" min="${today}"></label>
          </div>
          <label class="field"><span>Reason <em>*</em></span><textarea name="reason" maxlength="300" placeholder="e.g. exams, travelling"></textarea>
            <small>Dates are in UTC. Admins see the reason when they review it.</small></label>`,
          "Send request", async f => {
            await api("/api/leave", { start: f.start.value, end: f.end.value, reason: f.reason.value });
            load();
          });
      };
      const editSettings = () => {
        const ranks = ROLES.map(r => [String(r.id), r.name]);
        openForm("Quota settings", "Weekly hours each role should spend on shift. People with several roles get the biggest goal.", `
          <label class="pm"><span class="pm-text">Check weekly quotas<small>The first week checked is the next full one.</small></span>
            <span class="switch"><input type="checkbox" name="enabled" ${data.enabled ? "checked" : ""}><i></i></span></label>
          <div class="q-pair">${ranks.map(([k, l]) => `
            <label class="field"><span>${esc(l)} (hours)</span><input name="r${k}" type="number" min="0" max="168" step="0.5" value="${data.hours[k] ?? 0}"></label>`).join("")}
          </div>
          <p class="q-note">0 means no goal for that role.</p>`,
          "Save quotas", async f => {
            const saved = await api("/api/settings", { quotas: { enabled: f.enabled.checked, hours: Object.fromEntries(ranks.map(([k]) => [k, f["r" + k].value])) } });
            applyConfig(saved);
            load();
          });
      };

      const onTools = e => {
        if (e.target.closest("#qReq")) requestLeave();
        else if (e.target.closest("#qSet") && data) editSettings();
      };
      tools.addEventListener("click", onTools);
      $("qLeave").addEventListener("click", async e => {
        const b = e.target.closest("[data-leave]"); if (!b) return;
        if (b.dataset.a === "cancel" && !await ask({ title: "Cancel this leave?", ok: "Cancel leave", no: "Keep leave", danger: true })) return;
        b.disabled = true;
        try { await api("/api/leave/" + b.dataset.leave, { action: b.dataset.a }); } catch (err) { toast(err.message); }
        load();
      });

      load();
      const t = setInterval(load, 30000);
      return () => { clearInterval(t); tools.removeEventListener("click", onTools); };
    },
    settings: () => {
      const root = document.getElementById("setBody");
      let saved = null, blocked = [], clean = "";   // clean: the form as drawn, so dirty means the user changed something
      const SECTIONS = [["setAccess", "Access"], ["setMods", "Moderation logs"], ["setErlc", "ER:LC"], ["setRecords", "Records"]];

      // one row of the role grid: a checkbox per role for this permission
      const ladderRow = (roles, perm, label, lead = "") => {
        const id = "lad-" + perm.replace(/[^a-z0-9]/gi, "-");
        return `<div class="lad-row" role="group" aria-labelledby="${id}">
          <span class="lad-label" id="${id}">${lead}${esc(label)}</span>
          ${roles.map(r => `<label class="lad-cell" style="--c:${esc(r.color)}">
            <input type="checkbox" name="rp:${r.id}" value="${esc(perm)}" ${r.perms.includes(perm) ? "checked" : ""} aria-label="${esc(r.name)}">
            <span class="lad-pip">${ico("check")}</span></label>`).join("")}
        </div>`;
      };
      const ladderHead = roles => `<div class="lad-row lad-head" aria-hidden="true"><span></span>${roles.map(r =>
        `<span class="lad-rank" style="--c:${esc(r.color)}" title="${esc(r.name)}"><i></i>${esc(r.name)}</span>`).join("")}</div>`;
      const grid = (roles, body) => roles.length
        ? `<div class="lad multi" style="--cols:${roles.length}">${ladderHead(roles)}${body}</div>`
        : `<div class="set-card"><p class="set-none">No roles yet. Create them on the <a href="#roles">Roles</a> page.</p></div>`;
      const stepper = (name, label, value, min, max, unit) => `<div class="stepper">
          <button type="button" data-step="-1" data-for="${name}" aria-label="Decrease ${label}">${ico("minus")}</button>
          <input name="${name}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${value}" autocomplete="off" aria-label="${label} (${unit})">
          <span class="unit" aria-hidden="true">${unit}</span>
          <button type="button" data-step="1" data-for="${name}" aria-label="Increase ${label}">${ico("plus")}</button></div>`;
      const chips = () => blocked.length
        ? blocked.map((c, i) => `<span class="chip"><span translate="no">${esc(c)}</span><button type="button" data-unblock="${i}" aria-label="Remove ${esc(c)}">${ico("close")}</button></span>`).join("")
        : `<span class="chip-empty">Nothing blocked. Staff can run any command from the panel.</span>`;

      const draw = s => {
        blocked = [...s.blockedCommands];
        const known = new Set(PERM_GROUPS.flatMap(g => g[1]));
        const groups = [...PERM_GROUPS, ["Other", s.perms.filter(k => !known.has(k) && !k.startsWith("log."))]]
          .map(([g, keys]) => [g, keys.filter(k => s.perms.includes(k))]).filter(([, keys]) => keys.length);
        root.removeAttribute("aria-busy");
        root.innerHTML = `
          <nav class="set-rail" aria-label="Settings sections">${SECTIONS.map(([id, l]) => `<a href="#${id}" data-jump="${id}">${l}</a>`).join("")}</nav>
          <form id="setForm" class="set-main" novalidate>
            <section class="set-sec" id="setAccess" aria-labelledby="setAccessH">
              <h2 id="setAccessH">Access</h2>
              <p>Tick what each role can do. People get everything their roles allow. The owners listed in backend.py can always do everything.</p>
              ${grid(s.roles, groups.map(([g, keys]) => `<div class="lad-group">${g}</div>` +
                keys.map(k => ladderRow(s.roles, k, PERM_LABELS[k] || k)).join("")).join(""))}
            </section>
            <section class="set-sec" id="setMods" aria-labelledby="setModsH">
              <h2 id="setModsH">Moderation logs</h2>
              <p>Tick which roles can log each type.</p>
              ${grid(s.roles, MOD_TYPES.filter(t => s.perms.includes("log." + t.id)).map(t =>
                ladderRow(s.roles, "log." + t.id, t.label, `<span class="lad-ico" style="color:${t.color}">${ico(t.icon)}</span>`)).join(""))}
            </section>
            <section class="set-sec" id="setErlc" aria-labelledby="setErlcH">
              <h2 id="setErlcH">ER:LC</h2>
              <div class="set-card">
                <label class="set-line">
                  <span class="set-text"><b>Send moderations to the game</b><small>Logged kicks and bans also happen in game.</small></span>
                  <span class="switch"><input type="checkbox" name="autoErlc" ${s.autoErlc ? "checked" : ""}><i></i></span>
                </label>
                <div class="set-line col">
                  <span class="set-text"><b id="blkH">Blocked commands</b><small>The panel refuses these for everyone.</small></span>
                  <div class="chips" id="blkChips" aria-labelledby="blkH">${chips()}</div>
                  <div class="chip-add">
                    <input id="blkInput" type="text" placeholder=":kill" autocomplete="off" spellcheck="false" aria-label="Command to block">
                    <button class="btn-ghost btn-sm" id="blkAdd" type="button">${ico("plus")}Block command</button>
                  </div>
                  <small class="set-err" id="blkErr" role="alert"></small>
                </div>
              </div>
            </section>
            <section class="set-sec" id="setRecords" aria-labelledby="setRecordsH">
              <h2 id="setRecordsH">Records</h2>
              <div class="set-card">
                <div class="set-line"><span class="set-text"><b>Max strikes</b><small>Strikes stop counting here.</small></span>${stepper("maxStrikes", "Max strikes", s.maxStrikes, 1, 10, "strikes")}</div>
                <div class="set-line"><span class="set-text"><b>Max on shift at once</b><small>0 means no limit.</small></span>${stepper("maxOnShift", "Shift limit", s.maxOnShift, 0, 100, "people")}</div>
                <div class="set-line"><span class="set-text"><b>Keep server logs</b><small>Older logs are deleted.</small></span>${stepper("logRetentionDays", "Keep server logs", s.logRetentionDays, 1, 365, "days")}</div>
                <div class="set-line"><span class="set-text"><b>Keep command logs</b><small>Older commands are deleted.</small></span>${stepper("commandRetentionDays", "Keep command logs", s.commandRetentionDays, 1, 365, "days")}</div>
              </div>
            </section>
            <div class="savebar" id="saveBar" hidden>
              <span id="setMsg" role="status" aria-live="polite"></span>
              <button class="btn-ghost btn-sm" id="setReset" type="button">${ico("undo")}Discard</button>
              <button class="btn-primary" id="setSave" type="submit">${ico("save")}Save changes</button>
            </div>
          </form>`;
        clean = canon(read());
        sync();
      };

      const read = () => {
        const form = document.getElementById("setForm"), out = { rolePerms: {}, blockedCommands: [...blocked] };
        for (const r of saved.roles) out.rolePerms[r.id] = [];
        for (const [k, v] of new FormData(form)) if (k.startsWith("rp:")) (out.rolePerms[k.slice(3)] ||= []).push(v);
        const el = form.elements;
        out.autoErlc = el.autoErlc.checked;
        for (const k of ["maxStrikes", "maxOnShift", "logRetentionDays", "commandRetentionDays"]) out[k] = +el[k].value;
        return out;
      };
      // order-independent snapshot, so "dirty" means a value really changed
      const canon = o => JSON.stringify(Object.keys(o).sort().map(k => [k, o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) ? Object.entries(o[k]).sort() : o[k]]));
      const isDirty = () => !!saved && !!document.getElementById("setForm") && canon(read()) !== clean;
      const msg = (t, kind = "") => { const m = document.getElementById("setMsg"); m.textContent = t; m.className = kind; };
      const sync = () => {
        const bar = document.getElementById("saveBar"), dirty = isDirty();
        if (dirty) { bar.hidden = false; bar.classList.remove("done"); if (!document.getElementById("setMsg").className) msg("You have unsaved changes"); }
        else if (!bar.classList.contains("done")) bar.hidden = true;
        document.getElementById("setReset").hidden = !dirty;
        document.getElementById("setSave").disabled = !dirty;
      };

      const addBlocked = () => {
        const input = document.getElementById("blkInput"), err = document.getElementById("blkErr");
        let v = input.value.trim().toLowerCase(); if (!v) return;
        if (!v.startsWith(":")) v = ":" + v;
        if (!/^:[a-z0-9_]{1,30}$/.test(v)) { err.textContent = "Use a single command word, like :kill"; return; }
        err.textContent = "";
        if (!blocked.includes(v)) blocked.push(v);
        input.value = "";
        document.getElementById("blkChips").innerHTML = chips(); sync(); input.focus();
      };

      root.addEventListener("click", e => {
        const jump = e.target.closest("[data-jump]");
        if (jump) { e.preventDefault(); document.getElementById(jump.dataset.jump).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); return; }
        const un = e.target.closest("[data-unblock]");
        if (un) { blocked.splice(+un.dataset.unblock, 1); document.getElementById("blkChips").innerHTML = chips(); sync(); document.getElementById("blkInput").focus(); return; }
        if (e.target.closest("#blkAdd")) return addBlocked();
        const step = e.target.closest("[data-step]");
        if (step) {
          const input = document.getElementById("setForm").elements[step.dataset.for];
          input.value = Math.min(+input.max, Math.max(+input.min, (+input.value || 0) + +step.dataset.step)); sync(); return;
        }
        if (e.target.closest("#setReset") && saved) { draw(saved); }
      });
      root.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "blkInput") { e.preventDefault(); addBlocked(); } });
      root.addEventListener("input", e => { if (e.target.id === "blkInput") return; msg(""); sync(); });
      root.addEventListener("change", () => sync());
      root.addEventListener("submit", async e => {
        e.preventDefault();
        const next = read();
        const cut = [["logRetentionDays", "server logs"], ["commandRetentionDays", "command logs"]].filter(([k]) => next[k] < saved[k]);
        if (cut.length && !await ask({ title: "Delete older logs?", text: cut.map(([k, l]) => `Delete ${l} older than ${next[k]} days.`).join(" ") + " This can't be undone.", ok: "Save and delete", danger: true })) return;
        const btn = document.getElementById("setSave"); btn.disabled = true; btn.innerHTML = ico("loading") + "Saving…";
        try {
          saved = await api("/api/settings", next);
          applyConfig(saved);
          draw(saved);
          const bar = document.getElementById("saveBar"); bar.hidden = false; bar.classList.add("done");
          msg("Settings saved", "ok");
          setTimeout(() => { if (bar.isConnected && bar.classList.contains("done")) { bar.hidden = true; bar.classList.remove("done"); } }, 2500);
        } catch (err) { msg(err.message, "bad"); btn.innerHTML = ico("save") + "Save changes"; btn.disabled = false; }
      });

      const onLeave = e => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } };
      window.addEventListener("beforeunload", onLeave);
      api("/api/settings").then(s => { saved = s; draw(s); })
        .catch(err => { root.removeAttribute("aria-busy"); root.innerHTML = `<div class="placeholder">Couldn't load settings: ${esc(err.message)}</div>`; });
      return () => window.removeEventListener("beforeunload", onLeave);
    },
    shifts: () => {
      let range = 7;
      const $ = id => document.getElementById(id);
      const mine = () => ACTIVE_SHIFTS.find(a => a.name === USERNAME);
      const avatarOf = name => (STAFF.find(m => m.name === name) || {}).avatar || "";

      const tickTimers = () => {
        const a = mine(); const t = $("myTimer"); if (a && t) t.textContent = fmtClock(activeSeconds(a));
        document.querySelectorAll("#shNow .tmr").forEach(el => {
          const x = ACTIVE_SHIFTS.find(v => v.name === el.dataset.n); if (x) el.textContent = fmtClock(activeSeconds(x));
        });
      };
      const drawMine = () => {
        const a = mine();
        $("shMine").innerHTML = !a
          ? `<div class="shift-status"><i class="sdot"></i>Off shift</div><button class="btn-green" id="shStart" type="button">${ico("play")}Start shift</button>`
          : `<div class="shift-status"><i class="sdot ${a.onBreak ? "brk" : "on"}"></i>${a.onBreak ? "On break" : "On shift"}</div>
             <div class="shift-time" id="myTimer">0:00:00</div>
             <div class="shift-actions">
               ${a.onBreak ? `<button class="btn-green" id="shBreak" type="button">${ico("play")}End break</button>` : `<button class="btn-ghost btn-sm" id="shBreak" type="button">${ico("coffee")}Start break</button>`}
               <button class="btn-danger" id="shEnd" type="button">${ico("stop")}End shift</button>
             </div>`;
        tickTimers();
      };
      const drawNow = () => {
        $("shNow").innerHTML = ACTIVE_SHIFTS.length
          ? `<div style="padding:8px">${ACTIVE_SHIFTS.map(a => `<div class="now-row">${avatarHtml(a.name, a.avatar, "lg")}<span class="nm">${esc(a.name)}${a.onBreak ? '<span class="tag">on break</span>' : ""}</span><span class="tmr" data-n="${esc(a.name)}"></span></div>`).join("")}</div>`
          : empty("shifts", "Nobody is on shift", 120);
        tickTimers();
      };
      const drawBoard = () => {
        document.querySelectorAll("#lbTabs button").forEach(b => b.classList.toggle("active", +b.dataset.r === range));
        const since = Date.now() - range * 864e5, map = new Map();
        const get = (u, av) => { if (!map.has(u)) map.set(u, { user: u, avatar: av, secs: 0, shifts: 0 }); return map.get(u); };
        SHIFTS.filter(x => x.ended >= since).forEach(x => { const e = get(x.user, x.avatar); e.secs += doneSeconds(x); if (!x.revoked && !x.manual) e.shifts++; });
        ACTIVE_SHIFTS.forEach(a => { const e = get(a.name, a.avatar); e.secs += activeSeconds(a); e.shifts++; });
        const rows = [...map.values()].sort((a, b) => b.secs - a.secs || b.shifts - a.shifts || a.user.localeCompare(b.user));
        const max = Math.max(1, ...rows.map(r => r.secs));
        $("lbList").innerHTML = rows.length ? rows.map((r, i) => {
          const logs = MODERATIONS.filter(m => m.mod === r.user && m.at >= since).length;
          return `<div class="lb-row ${r.user === USERNAME ? "me" : ""}">
            <span class="lb-rank">${i === 0 ? ico("crown") : i + 1}</span>
            ${avatarHtml(r.user, r.avatar || avatarOf(r.user), "lg")}
            <div class="lb-main"><b>${esc(r.user)}</b><div class="lb-bar"><i style="width:max(${(r.secs / max * 100).toFixed(1)}%,12px)"></i></div>
              <div class="lb-meta">${r.shifts} ${r.shifts === 1 ? "shift" : "shifts"} \u00B7 ${logs} ${logs === 1 ? "log" : "logs"}</div></div>
            <span class="lb-time">${fmtDur(r.secs)}</span>
          </div>`;}).join("") : empty("trophy", "No shifts in this period", 200);
      };
      const drawRecent = () => {
        const rows = SHIFTS.filter(x => x.user === USERNAME).slice(0, 10);
        $("shRecent").innerHTML = `<table class="players"><thead><tr><th>Started</th><th>Ended</th><th>Time</th><th class="r">Logs</th></tr></thead><tbody>${
          rows.length ? rows.map(x => `<tr>
            <td style="white-space:nowrap">${x.revoked ? `<span class="struck">${esc(fmtDateTime(x.started))}</span><span class="revoked">Revoked</span>` : esc(fmtDateTime(x.started))}</td>
            <td style="white-space:nowrap">${esc(fmtDateTime(x.ended))}</td>
            <td class="mono-m">${fmtDur(doneSeconds(x))}</td>
            <td class="r">${x.logs}</td></tr>`).join("") : `<tr><td colspan="4"><div class="no-results">No shifts yet</div></td></tr>`}</tbody></table>`;
      };
      const drawAll = () => { drawMine(); drawNow(); drawBoard(); drawRecent(); };

      $("shMine").addEventListener("click", async e => {
        const b = e.target.closest("button"); if (!b) return;
        const action = { shStart: "start", shBreak: "break", shEnd: "end" }[b.id]; if (!action) return;
        b.disabled = true;
        try { setShifts(await api("/api/shifts/" + action, {})); } catch (err) { toast(err.message); }
        drawAll();
      });
      $("lbTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { range = +b.dataset.r; drawBoard(); } });

      drawAll();
      const t1 = setInterval(tickTimers, 1000);
      const t2 = setInterval(drawBoard, 5000);
      return () => { clearInterval(t1); clearInterval(t2); };
    },
    staff: () => {
      let tab = "team", filter = "everyone", query = "", menuEl = null, menuOpener = null;
      const tabs = document.getElementById("staffTabs"), body = document.getElementById("staffBody"), sub = document.getElementById("sub");
      const weekLogs = m => MODERATIONS.filter(x => x.mod === m.name && Date.now() - x.at < 7 * 864e5).length;

      const closeMenu = (refocus = false) => {
        if (menuEl) { menuEl.remove(); menuEl = null; }
        if (refocus && menuOpener && menuOpener.isConnected) menuOpener.focus();
        menuOpener = null;
      };

      const drawTabs = () => {
        tabs.innerHTML = `
          <button role="tab" aria-selected="${tab === "team"}" class="${tab === "team" ? "active" : ""}" data-t="team">${ico("players")}Team <span class="n">${STAFF.length}</span></button>`;
        sub.textContent = `${STAFF.length} on the staff team \u00B7 ${STAFF.filter(m => isOnShift(m.name)).length} on shift`;
      };

      const drawShell = () => {
        closeMenu();
        drawTabs();
        body.innerHTML = `
          <div class="filter-row">
            <div class="pills" id="staffPills" style="margin:0"></div>
            <span class="spacer"></span>
            <label class="search">${ico("search")}<input id="staffSearch" type="search" placeholder="Search staff…" autocomplete="off" aria-label="Search staff" value="${esc(query)}"></label>
          </div>
          <div id="staffTable"></div>`;
        document.getElementById("staffSearch").addEventListener("input", e => { query = e.target.value; drawTeam(); });
        drawTeam();
      };

      const drawTeam = () => {
        const present = [...new Map(STAFF.map(m => [m.rank, m.rankColor])).entries()];   // STAFF is sorted highest role first
        if (filter !== "everyone" && !present.includes(filter)) filter = "everyone";
        document.getElementById("staffPills").innerHTML =
          `<button class="pill ${filter === "everyone" ? "active" : ""}" data-f="everyone">Everyone <span class="n">${STAFF.length}</span></button>` +
          present.map(([r, c]) => `<button class="pill ${filter === r ? "active" : ""}" data-f="${esc(r)}" style="--dot:${esc(c)}"><span class="dot"></span>${esc(r)} <span class="n">${STAFF.filter(m => m.rank === r).length}</span></button>`).join("");

        const q = query.trim().toLowerCase();
        const rows = STAFF.filter(m => (filter === "everyone" || m.rank === filter) && (!q || m.name.toLowerCase().includes(q) || (m.handle || "").toLowerCase().includes(q)));
        document.getElementById("staffTable").innerHTML = rows.length ? `<div class="table-wrap"><table class="players">
          <thead><tr><th>Staff member</th><th>Roles</th><th>Strikes</th><th>Status</th><th>This week</th><th>Since</th><th></th></tr></thead>
          <tbody>${rows.map(m => {
            const you = m.id === USER_ID, logs = weekLogs(m);
            return `<tr class="staff-row" data-id="${esc(m.id)}" tabindex="0" aria-label="Open ${esc(m.name)}'s profile">
              <td><div class="pl">${avatarHtml(m.name, m.avatar, "lg")}<div class="who"><div><b>${esc(m.name)}</b>${you ? '<span class="you">you</span>' : ""}</div><small>@${esc(m.handle || "")}</small></div></div></td>
              <td><span class="role-list">${roleBadges(m)}</span></td>
              <td><span class="strikes" role="img" aria-label="${m.strikes} of ${MAX_STRIKES} strikes">${Array.from({ length: MAX_STRIKES }, (_, i) => `<i class="${i < m.strikes ? "on" : ""}"></i>`).join("")}</span></td>
              <td>${isOnShift(m.name) ? '<span class="onshift">On shift</span>' : "Off shift"}</td>
              <td class="wk"><b>${fmtDur(weekSecondsFor(m.name))}</b> \u00B7 ${logs} ${logs === 1 ? "log" : "logs"}</td>
              <td style="white-space:nowrap">${esc(timeAgo(m.since))}</td>
              <td class="r">${!m.canManage && !m.assignable.length ? "" : `<button class="dots-btn" type="button" data-id="${esc(m.id)}" aria-label="Actions for ${esc(m.name)}" aria-haspopup="menu">${ico("more")}</button>`}</td>
            </tr>`;}).join("")}</tbody></table></div>`
          : `<div class="empty-card">${ico("players")}<b>No staff match</b></div>`;
        drawTabs();
      };

      // row menu: the backend re-checks every action and answers with the fresh staff list
      const openMenu = btn => {
        closeMenu();
        const m = STAFF.find(x => x.id === btn.dataset.id); if (!m) return;
        const act = (path, body) => async () => {
          try { STAFF.splice(0, STAFF.length, ...await api(`/api/staff/${m.id}/${path}`, body)); } catch (err) { toast(err.message); }
          drawTeam();
        };
        const items = [
          { label: "Edit roles",   icon: "roles", off: !m.assignable.length,                     run: () => editRoles(m, drawTeam) },
          { label: "Add strike",   icon: "warn",  off: !m.canManage || m.strikes >= MAX_STRIKES, run: act("strike", { delta: 1 }) },
          { label: "Remove strike",icon: "minus", off: !m.canManage || m.strikes <= 0,           run: act("strike", { delta: -1 }) }
        ];
        menuEl = document.createElement("div");
        menuEl.className = "menu"; menuEl.setAttribute("role", "menu");
        menuEl.innerHTML = items.map((it, k) => `<button type="button" role="menuitem" data-k="${k}" ${it.off ? "disabled" : ""}>${ico(it.icon)}${it.label}</button>`).join("");
        document.body.appendChild(menuEl);
        menuOpener = btn;
        const r = btn.getBoundingClientRect(), mw = menuEl.offsetWidth, mh = menuEl.offsetHeight;
        menuEl.style.left = Math.max(8, Math.min(window.innerWidth - mw - 8, r.right - mw)) + "px";
        menuEl.style.top = (r.bottom + mh + 8 > window.innerHeight ? Math.max(8, r.top - mh - 4) : r.bottom + 4) + "px";
        menuEl.addEventListener("click", e => {
          const b = e.target.closest("button"); if (!b || b.disabled) return;
          closeMenu();
          items[+b.dataset.k].run();
        });
        const first = menuEl.querySelector("button:not(:disabled)"); if (first) first.focus();
      };

      tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.t !== tab) { tab = b.dataset.t; drawShell(); } });
      body.addEventListener("click", e => {
        const pill = e.target.closest(".pill"); if (pill) { filter = pill.dataset.f; drawTeam(); return; }
        const dots = e.target.closest(".dots-btn"); if (dots) { if (menuOpener === dots) closeMenu(); else openMenu(dots); return; }
        const row = e.target.closest(".staff-row"); if (row) openProfile(row.dataset.id);
      });
      body.addEventListener("keydown", e => {
        const row = e.target.closest(".staff-row");
        if (row && e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProfile(row.dataset.id); }
      });
      const openProfile = id => { const m = STAFF.find(x => x.id === id); if (m) openStaffProfile(m, drawTeam); };
      const onDoc = e => { if (menuEl && !menuEl.contains(e.target) && !e.target.closest(".dots-btn")) closeMenu(); };
      const onKey = e => { if (e.key === "Escape" && menuEl) closeMenu(true); };
      const onScroll = () => closeMenu();
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onScroll);
      document.querySelector(".content").addEventListener("scroll", onScroll);

      drawShell();
      return () => {
        closeMenu();
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onScroll);
        document.querySelector(".content").removeEventListener("scroll", onScroll);
      };
    },
    commands: () => {
      const input = document.getElementById("cmdInput"), runBtn = document.getElementById("cmdRun"), hist = document.getElementById("cmdHist");
      let busy = false, until = 0;

      const setBtn = () => {
        const left = Math.ceil((until - Date.now()) / 1000);
        const label = busy ? "Running\u2026" : left > 0 ? `Wait ${left}s` : "Run";
        runBtn.disabled = busy || left > 0;
        runBtn.innerHTML = `${ico("play")}${label}`;
      };
      const drawHistory = () => {
        hist.innerHTML = COMMAND_HISTORY.length ? COMMAND_HISTORY.slice(0, 20).map(h => `
          <div class="hrow ${h.ok ? "ok" : "fail"}">
            ${ico(h.ok ? "checkcircle" : "xcircle")}
            <span class="hcmd" title="${esc(h.command)}">${esc(h.command)}</span>
            ${h.ok ? "" : `<span class="herr" title="${esc(h.error)}">${esc(h.error)}</span>`}
            <span class="hmeta">${esc(h.user)} \u00B7 ${esc(timeAgo(h.at))}</span>
          </div>`).join("") : empty("commands", "No commands run yet");
      };

      const run = async () => {
        let cmd = input.value.trim();
        if (!cmd || busy || Date.now() < until) return;
        if (!cmd.startsWith(":")) cmd = ":" + cmd;
        const name = cmd.split(/\s+/)[0].toLowerCase();
        let ok = false, error = "", sent = false;

        if (BLOCKED_COMMANDS.includes(name)) {
          error = "Run this command in game. The panel won't send it.";
        } else if (!COMMAND_ENDPOINT) {
          error = "Not connected to the server yet.";
        } else {
          busy = true; sent = true; setBtn();
          try {
            const d = await api(COMMAND_ENDPOINT, { command: cmd });
            ok = d.ok !== false;
            if (!ok) error = d.error;
          } catch (err) { error = err.message; }
          busy = false;
        }

        const now = Date.now();
        // the backend records sent commands; commands blocked here only show locally
        let synced = false;
        if (sent) try { COMMAND_HISTORY.splice(0, COMMAND_HISTORY.length, ...await api(COMMAND_ENDPOINT)); synced = true; } catch (err) {}
        if (!synced) COMMAND_HISTORY.unshift({ command: cmd, ok, error, user: USERNAME, at: now });
        if (ok) input.value = "";
        if (sent) until = now + COMMAND_COOLDOWN_MS;
        drawHistory(); setBtn();
      };

      runBtn.addEventListener("click", run);
      input.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
      document.querySelector(".quick").addEventListener("click", e => {
        const t = e.target.closest(".tile"); if (!t) return;
        input.value = QUICK_COMMANDS[+t.dataset.i].fill + " ";
        input.focus();
      });

      drawHistory(); setBtn();
      const tick = setInterval(() => { setBtn(); drawHistory(); }, 1000);
      return () => clearInterval(tick);
    },
    serverlogs: () => {
      const FILTERS = [
        { id: "all",     label: "Everything", dot: null },
        { id: "join",    label: "Joins",      dot: "#3ddc97" },
        { id: "leave",   label: "Leaves",     dot: "#8b8f98" },
        { id: "kill",    label: "Kills",      dot: "#ef4444" },
        { id: "command", label: "Commands",   dot: "#d4d4d4" },
        { id: "modcall", label: "Mod calls",  dot: "#f5a623" }
      ];
      let filter = "all", query = "", shown = 100, alive = true;
      const pills = document.getElementById("logPills"), list = document.getElementById("logList"), more = document.getElementById("logMore");

      const draw = () => {
        const q = query.trim().toLowerCase();
        const rows = SERVER_LOGS.filter(l =>
          Date.now() - l.at <= (l.type === "command" ? COMMAND_RETENTION_DAYS : LOG_RETENTION_DAYS) * 864e5 &&
          (filter === "all" || l.type === filter) &&
          (!q || [l.user, l.cmd, l.target, l.text].join(" ").toLowerCase().includes(q)));

        pills.innerHTML = FILTERS.map(f => `<button class="pill ${f.id === filter ? "active" : ""}" data-f="${f.id}" ${f.dot ? `style="--dot:${f.dot}"` : ""}>${f.dot ? '<span class="dot"></span>' : ""}${f.label}</button>`).join("");
        list.innerHTML = rows.length ? rows.slice(0, shown).map(l => logRow(l, true)).join("") : empty("pulse", SERVER_LOGS.length ? "No logs match" : "No logs yet");
        more.hidden = rows.length <= shown;
        more.innerHTML = rows.length > shown ? `<button class="btn-ghost" id="logMoreBtn" type="button">${ico("chevrondown")}Load more</button>` : "";
      };

      pills.addEventListener("click", e => { const b = e.target.closest(".pill"); if (b) { filter = b.dataset.f; shown = 100; draw(); } });
      more.addEventListener("click", e => { if (e.target.closest("#logMoreBtn")) { shown += 100; draw(); } });
      document.getElementById("logSearch").addEventListener("input", e => { query = e.target.value; shown = 100; draw(); });
      const clearBtn = document.getElementById("logClear");
      if (clearBtn) clearBtn.addEventListener("click", async () => {
        if (!await ask({ title: "Clear all server logs?", text: "This deletes every saved server log for everyone and can't be undone. Command history on the Commands page stays.", ok: "Clear logs", danger: true })) return;
        clearBtn.disabled = true;
        try { await api("/api/logs/clear", {}); SERVER_LOGS.length = 0; draw(); } catch (err) { toast(err.message); }
        clearBtn.disabled = false;
      });

      const poll = async () => {
        if (!LOGS_ENDPOINT) return;
        try {
          const r = await fetch(LOGS_ENDPOINT, { cache: "no-store" });
          if (!r.ok) throw new Error("HTTP " + r.status);
          const data = await r.json();
          SERVER_LOGS.splice(0, SERVER_LOGS.length, ...(Array.isArray(data) ? data : []).sort((a, b) => b.at - a.at));
          if (alive) draw();
        } catch (err) { /* keep showing what we have */ }
      };
      draw();
      poll();
      const pollTimer = setInterval(poll, LOGS_POLL_MS);
      const tick = setInterval(draw, 30000);   // keeps "5m ago" fresh
      return () => { alive = false; clearInterval(pollTimer); clearInterval(tick); };
    },
    bans: () => {
      let query = "";
      const canUnban = USER_PERMS.includes("bans.remove");
      const list = document.getElementById("banList");
      const sub = document.getElementById("sub");

      const draw = () => {
        sub.textContent = `${BANS.length} banned on the ER:LC server \u00B7 checked ${timeAgo(bansCheckedAt)}`;
        const q = query.trim().toLowerCase();
        const rows = BANS.filter(b => !q || b.name.toLowerCase().includes(q) || b.id.includes(q));
        if (!BANS.length) {
          list.innerHTML = `<div class="empty-card">${ico("bans")}<b>Nobody is banned</b></div>`;
        } else if (!rows.length) {
          list.innerHTML = `<div class="empty-card">${ico("bans")}<b>No matching bans</b></div>`;
        } else {
          list.innerHTML = `<div class="table-wrap"><table class="players">
            <thead><tr><th>Player</th><th>User ID</th>${canUnban ? "<th></th>" : ""}</tr></thead>
            <tbody>${rows.map(b => `<tr>
              <td><div class="pl">${robloxAvatar(b.name, b.id)}<span class="pname">${esc(b.name || "Unknown")}</span></div></td>
              <td class="case">${esc(b.id || "\u2013")}</td>
              ${canUnban ? `<td>${/^\d+$/.test(b.id) ? `<button class="btn-ghost btn-sm" type="button" data-unban="${esc(b.id)}" data-name="${esc(b.name || b.id)}">${ico("unlock")}Unban</button>` : ""}</td>` : ""}
            </tr>`).join("")}</tbody></table></div>`;
        }
      };

      const refresh = async () => {
        const btn = document.getElementById("banRefresh");
        btn.disabled = true;
        try {
          BANS.splice(0, BANS.length, ...normalizeBans(await api(BANS_ENDPOINT)));
          bansCheckedAt = Date.now();
        } catch (err) {
          sub.textContent = "Couldn't refresh the ban list. Press Refresh to try again.";
          btn.disabled = false;
          return;
        }
        btn.disabled = false;
        draw();
      };

      document.getElementById("banSearch").addEventListener("input", e => { query = e.target.value; draw(); });
      document.getElementById("banRefresh").addEventListener("click", refresh);
      list.addEventListener("click", async e => {
        const btn = e.target.closest("[data-unban]");
        if (!btn || !await ask({ title: `Unban ${btn.dataset.name}?`, text: "They'll be able to join the ER:LC server again.", ok: "Unban", danger: true })) return;
        btn.disabled = true;
        try {
          await api(`/api/bans/${btn.dataset.unban}/unban`, {});
        } catch (err) {
          sub.textContent = `Couldn't unban ${btn.dataset.name}: ${err.message}`;
          btn.disabled = false;
          return;
        }
        BANS.splice(BANS.findIndex(b => b.id === btn.dataset.unban), 1);
        draw();
      });
      // "Ban someone" opens the moderation log dialog with Ban preselected, so every ban is also logged
      document.getElementById("banAdd").addEventListener("click", () => openLogModal(entry => {
        if (entry.type === "ban") BANS.unshift({ name: entry.user, id: "" });
        draw();
      }, "ban"));
      draw();
      refresh();
      const tick = setInterval(draw, 30000);   // keeps "checked just now" fresh
      return () => clearInterval(tick);
    },
    livemap: () => {
      const $ = id => document.getElementById(id);
      const map = $("lmMap"), stage = $("lmStage"), img = $("lmImg"), layer = $("lmLayer");
      let players = [], filter = "all", query = "", selected = null, failed = false, alive = true;
      let iw = 0, ih = 0, fit = 1, view = { s: 1, tx: 0, ty: 0 };

      const toPx = p => {
        const b = MAP_BOUNDS;
        const fz = (p.z - b.zMin) / (b.zMax - b.zMin);
        return { x: (p.x - b.xMin) / (b.xMax - b.xMin) * iw, y: (FLIP_Z ? 1 - fz : fz) * ih };
      };
      const apply = () => {
        stage.style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.s})`;
        stage.style.setProperty("--inv", String(1 / view.s));
        map.style.backgroundPosition = `${view.tx}px ${view.ty}px`;
      };
      const fitView = () => {
        const r = map.getBoundingClientRect();
        if (!iw || !r.width) return;
        fit = Math.min(r.width / iw, r.height / ih) * 0.96;
        view = { s: fit, tx: (r.width - iw * fit) / 2, ty: (r.height - ih * fit) / 2 };
        apply();
      };
      const zoomAt = (f, cx, cy) => {
        const ns = Math.min(fit * 12, Math.max(fit * 0.6, view.s * f));
        const k = ns / view.s;
        view.tx = cx - (cx - view.tx) * k; view.ty = cy - (cy - view.ty) * k; view.s = ns;
        apply();
      };
      const zoomCenter = f => { const r = map.getBoundingClientRect(); zoomAt(f, r.width / 2, r.height / 2); };
      const centerOn = p => {
        const r = map.getBoundingClientRect(), pt = toPx(p);
        view.s = Math.max(view.s, fit * 3);
        view.tx = r.width / 2 - pt.x * view.s; view.ty = r.height / 2 - pt.y * view.s;
        apply();
      };

      const visible = () => {
        const q = query.trim().toLowerCase();
        return players.filter(p => (filter === "all" || p.team === filter) &&
          (!q || p.name.toLowerCase().includes(q) || (p.callsign || "").toLowerCase().includes(q)));
      };
      const color = t => TEAM_COLORS[t] || "#6b6e75";
      const where = p => [p.postal ? "Postal " + p.postal : "", p.street].filter(Boolean).join(" \u00B7 ");

      const draw = () => {
        const teams = [...new Set(players.map(p => p.team))];
        if (filter !== "all" && !teams.includes(filter)) filter = "all";
        $("lmSub").textContent = failed ? "Can't reach the server \u00B7 retrying"
          : `${players.length} ${players.length === 1 ? "player" : "players"} \u00B7 updates every few seconds`;
        $("lmPills").innerHTML =
          `<button class="pill ${filter === "all" ? "active" : ""}" data-f="all">All <span class="n">${players.length}</span></button>` +
          teams.map(t => `<button class="pill ${filter === t ? "active" : ""}" data-f="${esc(t)}" style="--dot:${color(t)}"><span class="dot"></span>${esc(t)} <span class="n">${players.filter(p => p.team === t).length}</span></button>`).join("");

        const vis = visible();
        $("lmList").innerHTML = vis.map(p => `
          <button class="lm-row ${p.name === selected ? "sel" : ""}" data-n="${esc(p.name)}" style="--c:${color(p.team)}">
            <i></i><b>${esc(p.name)}</b><span>${esc(p.callsign || (p.postal ? "P" + p.postal : ""))}</span>
          </button>`).join("");

        layer.innerHTML = iw ? vis.filter(p => Number.isFinite(p.x) && Number.isFinite(p.z)).map(p => {
          const pt = toPx(p);
          return `<button class="lm-pin ${p.name === selected ? "sel" : ""}" data-n="${esc(p.name)}" aria-label="${esc(p.name)}" style="left:${pt.x}px;top:${pt.y}px;--c:${color(p.team)}">
            <span class="lm-tip"><b>${esc(p.name)}</b><span>${esc(p.team)}${p.callsign ? " \u00B7 " + esc(p.callsign) : ""}</span>${where(p) ? `<span>${esc(where(p))}</span>` : ""}</span>
          </button>`;
        }).join("") : "";
        drawCard();
      };

      // details card for the selected player
      const card = $("lmCard");
      let cardHtml = "";
      const drawCard = () => {
        const p = selected && players.find(x => x.name === selected);
        const html = !p ? "" : `
          <button class="lm-btn lm-card-x" type="button" data-close aria-label="Close">${ico("close")}</button>
          <div class="lm-card-av">${/^\d+$/.test(p.id) ? `<img src="/api/roblox/avatar/${p.id}" width="170" height="170" alt="${esc(p.name)}'s Roblox avatar" draggable="false">` : ""}</div>
          <div class="lm-card-body">
            <h3>${esc(p.name)}</h3>
            <dl>
              <dt>Team</dt><dd><i></i>${esc(p.team)}</dd>
              ${p.callsign ? `<dt>Callsign</dt><dd>${esc(p.callsign)}</dd>` : ""}
              <dt>Permission</dt><dd>${esc(p.permission)}</dd>
              ${where(p) ? `<dt>Location</dt><dd>${esc(where(p))}</dd>` : ""}
              ${p.id ? `<dt>User ID</dt><dd class="mono">${esc(p.id)}</dd>` : ""}
            </dl>
            ${/^\d+$/.test(p.id) ? `<a href="https://www.roblox.com/users/${p.id}/profile" target="_blank" rel="noopener noreferrer">Roblox profile</a>` : ""}
          </div>`;
        if (html === cardHtml) return;   // don't rebuild (and reload the avatar) when nothing changed
        cardHtml = html;
        card.innerHTML = html;
        card.querySelector("img")?.addEventListener("error", e => e.target.remove());
        card.hidden = !p;
        if (p) card.style.setProperty("--c", color(p.team));
      };
      card.addEventListener("click", e => { if (e.target.closest("[data-close]")) { selected = null; draw(); } });
      // drag the card around the map; buttons and links still click
      card.addEventListener("pointerdown", e => {
        if (e.button !== 0 || e.target.closest("button,a")) return;
        e.preventDefault();
        const box = card.offsetParent.getBoundingClientRect(), c = card.getBoundingClientRect();
        const ox = e.clientX - c.left, oy = e.clientY - c.top;
        const move = ev => {
          card.style.left = Math.min(Math.max(0, ev.clientX - box.left - ox), box.width - c.width) + "px";
          card.style.top = Math.min(Math.max(0, ev.clientY - box.top - oy), box.height - c.height) + "px";
        };
        const up = () => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerup", up); card.removeEventListener("pointercancel", up); };
        card.setPointerCapture(e.pointerId);
        card.addEventListener("pointermove", move); card.addEventListener("pointerup", up); card.addEventListener("pointercancel", up);
      });

      const onLoad = () => {
        iw = img.naturalWidth; ih = img.naturalHeight;
        stage.style.width = iw + "px"; stage.style.height = ih + "px";
        fitView(); draw();
      };
      img.addEventListener("load", onLoad);
      const fallbacks = [...MAP_FALLBACKS];
      img.addEventListener("error", () => {
        if (fallbacks.length) { img.src = fallbacks.shift(); return; }
        const n = $("lmNote"); n.hidden = false;
        n.textContent = "Couldn't load the map image. Download it and set MAP_URL to your own copy.";
      });
      if (img.complete && img.naturalWidth) onLoad();

      // select from list or pin
      $("lmList").addEventListener("click", e => {
        const b = e.target.closest(".lm-row"); if (!b) return;
        selected = b.dataset.n;
        const p = players.find(x => x.name === selected);
        if (p && Number.isFinite(p.x)) centerOn(p);
        draw();
      });
      layer.addEventListener("click", e => {
        const b = e.target.closest(".lm-pin"); if (!b) return;
        selected = b.dataset.n; draw();
      });
      $("lmPills").addEventListener("click", e => {
        const b = e.target.closest(".pill"); if (b) { filter = b.dataset.f; draw(); }
      });
      $("lmSearch").addEventListener("input", e => { query = e.target.value; draw(); });

      // pan + zoom
      let drag = null, dragMoved = false;
      map.addEventListener("pointerdown", e => {
        if (e.target.closest(".lm-ctrl,.lm-card")) return;
        drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, id: e.pointerId };
        dragMoved = false;
      });
      map.addEventListener("pointermove", e => {
        if (drag) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (!dragMoved && Math.hypot(dx, dy) > 4) { dragMoved = true; map.setPointerCapture(drag.id); map.classList.add("grabbing"); }
          if (dragMoved) { view.tx = drag.tx + dx; view.ty = drag.ty + dy; apply(); }
        }
        if (SHOW_COORDS && iw) {
          const r = map.getBoundingClientRect(), b = MAP_BOUNDS;
          const fx = (e.clientX - r.left - view.tx) / view.s / iw;
          let fz = (e.clientY - r.top - view.ty) / view.s / ih; if (FLIP_Z) fz = 1 - fz;
          const c = $("lmCoords"); c.hidden = false;
          c.textContent = `X ${Math.round(b.xMin + fx * (b.xMax - b.xMin))} \u00B7 Z ${Math.round(b.zMin + fz * (b.zMax - b.zMin))}`;
        }
      });
      const endDrag = () => { drag = null; map.classList.remove("grabbing"); };
      map.addEventListener("pointerup", endDrag);
      map.addEventListener("pointercancel", endDrag);
      map.addEventListener("click", e => {
        if (dragMoved || e.target.closest(".lm-pin,.lm-ctrl,.lm-card")) return;
        if (selected) { selected = null; draw(); }
      });
      map.addEventListener("wheel", e => {
        e.preventDefault();
        const r = map.getBoundingClientRect();
        zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
      }, { passive: false });

      // keyboard: arrows pan, +/- zoom
      map.addEventListener("keydown", e => {
        const step = 80, d = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
        if (d) { e.preventDefault(); view.tx += d[0]; view.ty += d[1]; apply(); }
        else if (e.key === "+" || e.key === "=") zoomCenter(1.4);
        else if (e.key === "-") zoomCenter(1 / 1.4);
      });

      // buttons
      $("lmGrid").onclick = e => { const off = map.classList.toggle("nogrid"); e.currentTarget.setAttribute("aria-pressed", String(!off)); };
      $("lmReset").onclick = fitView;
      $("lmIn").onclick = () => zoomCenter(1.4);
      $("lmOut").onclick = () => zoomCenter(1 / 1.4);
      $("lmFull").onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (map.requestFullscreen) map.requestFullscreen(); };
      const onFs = () => setTimeout(fitView, 50);
      document.addEventListener("fullscreenchange", onFs);

      // live data
      const poll = async () => {
        try {
          if (LIVE_ENDPOINT) {
            const r = await fetch(LIVE_ENDPOINT, { cache: "no-store" });
            if (!r.ok) throw new Error("HTTP " + r.status);
            players = normalizePlayers(await r.json());
          } else {
            players = PLAYERS.filter(p => Number.isFinite(p.x) && Number.isFinite(p.z));
          }
          failed = false;
        } catch (err) { failed = true; }
        if (alive) draw();
      };
      poll();
      const timer = setInterval(poll, LIVE_POLL_MS);
      draw();
      return () => { alive = false; clearInterval(timer); document.removeEventListener("fullscreenchange", onFs); };
    },
    moderations: () => {
      let filter = "all", onlyMine = false, query = "";
      const pills = document.getElementById("modPills");
      const list = document.getElementById("modList");

      const draw = () => {
        pills.innerHTML = `<button class="pill ${filter === "all" ? "active" : ""}" data-f="all">All</button>` +
          MOD_TYPES.map(t => `<button class="pill ${filter === t.id ? "active" : ""}" data-f="${t.id}" style="--c:${t.color}"><span class="dot"></span>${t.label}</button>`).join("");

        const q = query.trim().toLowerCase();
        const rows = MODERATIONS.filter(m =>
          (filter === "all" || m.type === filter) &&
          (!onlyMine || m.mod === USERNAME) &&
          (!q || m.user.toLowerCase().includes(q) || m.reason.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)));

        if (!MODERATIONS.length) {
          list.innerHTML = `<div class="empty-card">${ico("moderations")}<b>No moderations yet</b><p>Log a warning, kick or ban and it shows here for the whole staff team.</p></div>`;
        } else if (!rows.length) {
          list.innerHTML = `<div class="empty-card">${ico("moderations")}<b>No matching moderations</b><p>Try a different filter or search.</p></div>`;
        } else {
          list.innerHTML = `<div class="table-wrap"><table class="players">
            <thead><tr><th>Log</th><th>Player</th><th>Reason</th><th>Moderator</th><th>Status</th><th class="r">When</th></tr></thead>
            <tbody>${rows.map(m => {
              const t = typeById(m.type);
              const link = /^https?:\/\//i.test(m.evidence) ? `<a href="${esc(m.evidence)}" target="_blank" rel="noopener noreferrer">Evidence</a>` : "";
              return `<tr class="click-row" data-id="${esc(m.id)}" tabindex="0" aria-label="Open log ${esc(m.id)}">
                <td style="white-space:nowrap"><span class="logbadge" style="--c:${t.color}">${ico(t.icon)}${t.label}</span><span class="logid">${esc(m.id)}</span>${m.duration ? `<span class="logdur">${esc(m.duration)}</span>` : ""}</td>
                <td><span class="pname">${esc(m.user)}</span></td>
                <td><div class="reason"><span title="${esc(m.reason)}">${esc(m.reason)}</span>${link}</div></td>
                <td><span class="mod">${avatarHtml(m.mod, m.modAvatar)}${esc(m.mod)}</span></td>
                <td><span class="status">${esc(m.status || "Logged")}</span></td>
                <td class="r" style="white-space:nowrap;color:var(--label)">${esc(timeAgo(m.at))}</td>
              </tr>`;}).join("")}</tbody></table></div>`;
        }
      };

      pills.addEventListener("click", e => {
        const b = e.target.closest(".pill");
        if (b) { filter = b.dataset.f; draw(); }
      });
      document.getElementById("onlyMine").addEventListener("change", e => { onlyMine = e.target.checked; draw(); });
      document.getElementById("modSearch").addEventListener("input", e => { query = e.target.value; draw(); });
      document.getElementById("newLog").addEventListener("click", () => openLogModal(draw));
      const openRow = row => { const m = MODERATIONS.find(x => x.id === row.dataset.id); if (m) openLogDetail(m, draw); };
      list.addEventListener("click", e => { const row = e.target.closest(".click-row"); if (row && !e.target.closest("a")) openRow(row); });
      list.addEventListener("keydown", e => {
        const row = e.target.closest(".click-row");
        if (row && e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openRow(row); }
      });
      draw();
    },
    players: () => {
      let filter = "everyone", query = "";
      const teams = [...new Set(PLAYERS.map(p => p.team))];
      const filters = [
        { id: "everyone", label: "Everyone", dot: null, test: () => true },
        { id: "staff", label: "Staff", dot: "#e6ebf0", test: isStaff },
        ...teams.map(t => ({ id: "team:" + t, label: t, dot: TEAM_COLORS[t] || "#6b6e75", test: p => p.team === t }))
      ];
      const pills = document.getElementById("pills");
      const body = document.getElementById("playerRows");

      const draw = () => {
        pills.innerHTML = filters.map(f => `
          <button class="pill ${f.id === filter ? "active" : ""}" data-f="${esc(f.id)}" ${f.dot ? `style="--dot:${f.dot}"` : ""}>
            ${f.dot ? '<span class="dot"></span>' : ""}${esc(f.label)} <span class="n">${PLAYERS.filter(f.test).length}</span>
          </button>`).join("");

        const active = filters.find(f => f.id === filter) || filters[0];
        const q = query.trim().toLowerCase();
        const rows = PLAYERS.filter(active.test).filter(p => !q || p.name.toLowerCase().includes(q) || (p.callsign || "").toLowerCase().includes(q));

        body.innerHTML = rows.length ? rows.map(p => `
          <tr class="click-row" data-n="${esc(p.name)}" tabindex="0" aria-label="Open ${esc(p.name)}'s overview">
            <td><div class="pl">${robloxAvatar(p.name, p.id)}<span class="pname">${esc(p.name)}</span></div></td>
            <td><span class="team" style="--dot:${TEAM_COLORS[p.team] || "#6b6e75"}"><i></i>${esc(p.team)}</span></td>
            <td>${p.callsign ? esc(p.callsign) : "\u2013"}</td>
            <td>${esc(p.location)}</td>
            <td>${PERM_COLORS[p.permission] ? `<span class="badge" style="--c:${PERM_COLORS[p.permission]}">${esc(p.permission)}</span>` : "\u2013"}</td>
          </tr>`).join("") : `<tr><td colspan="5"><div class="no-results">No players match.</div></td></tr>`;
      };

      pills.addEventListener("click", e => {
        const b = e.target.closest(".pill");
        if (b) { filter = b.dataset.f; draw(); }
      });
      document.getElementById("playerSearch").addEventListener("input", e => { query = e.target.value; draw(); });
      const openRow = row => { const p = PLAYERS.find(x => x.name === row.dataset.n); if (p) openPlayerProfile(p); };
      body.addEventListener("click", e => { const row = e.target.closest(".click-row"); if (row) openRow(row); });
      body.addEventListener("keydown", e => {
        const row = e.target.closest(".click-row");
        if (row && e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openRow(row); }
      });
      draw();
    }
  };

  const PAGES = {
    roles: () => `<section class="panel"><div id="roleList">${empty("loading", "Loading\u2026", 160)}</div></section>`,
    automated: () => `
      <div class="q-banner">Messages only send when there is at least 1 person on shift, so factor that in when you create them.</div>
      <div class="auto-grid" id="autoList">${empty("loading", "Loading\u2026", 160)}</div>`,
    quotas: () => `
      <div id="qBanner"></div>
      <div class="q-grid">
        <div class="q-col">
          <section class="panel"><div class="panel-head"><span class="t">${ico("quotas")}Your week</span></div><div class="q-mine" id="qMine"></div></section>
          <section class="panel"><div class="panel-head"><span class="t">${ico("leave")}Leave</span></div><div id="qLeave"></div>
            <p class="q-foot">Approved leave lowers the weekly goal by the days you're away.</p></section>
        </div>
        <div class="q-col">
          <section class="panel"><div class="panel-head"><span class="t">${ico("staff")}This week</span><span class="q-count" id="qMet"></span></div>
            <div id="qWeek">${empty("loading", "Loading\u2026", 120)}</div></section>
          <section class="panel"><div class="panel-head"><span class="t">${ico("history")}Past weeks</span></div><div id="qPast"></div></section>
        </div>
      </div>`,
    shifts: () => `
      <div class="shifts-grid">
        <section class="panel"><div class="panel-head"><span class="t">${ico("stopwatch")}Your shift</span></div><div class="shift-box" id="shMine"></div></section>
        <section class="panel"><div class="panel-head"><span class="t">${ico("shifts")}On shift now</span></div><div class="panel-body" id="shNow"></div></section>
        <section class="panel">
          <div class="panel-head"><span class="t">${ico("trophy")}Leaderboard</span>
            <div class="seg" id="lbTabs"><button data-r="7">7 days</button><button data-r="30">30 days</button></div></div>
          <div class="lb" id="lbList"></div>
        </section>
      </div>
      <section class="panel" style="margin-top:16px"><div class="panel-head"><span class="t">${ico("history")}Your recent shifts</span></div><div id="shRecent"></div></section>`,
    staff: () => `<div class="seg" id="staffTabs" role="tablist"></div><div class="staff-body" id="staffBody"></div>`,
    settings: () => `<div id="setBody" class="set-wrap" aria-busy="true"><div class="set-skel"><i></i><i></i><i></i></div></div>`,
    commands: () => `
      <section class="term">
        <div class="term-head"><span class="term-title">${esc(SERVER_NAME ? SERVER_NAME + " \u00B7 ER:LC" : "ER:LC")}</span></div>
        <div class="term-body">
          ${ico("chevron")}
          <input id="cmdInput" type="text" placeholder=":m Server restart in 5 minutes" autocomplete="off" spellcheck="false" aria-label="Command">
          <button class="btn-primary run" id="cmdRun" type="button"></button>
        </div>
      </section>
      <div class="quick">${QUICK_COMMANDS.map((c, i) => `<button class="tile" type="button" data-i="${i}"><b>${esc(c.title)}</b><span>${esc(c.hint)}</span></button>`).join("")}</div>
      <p class="quick-note">Run admin, mod and shutdown commands in game. The panel blocks them.</p>
      <section class="panel">
        <div class="panel-head"><span class="t">${ico("commands")}History</span></div>
        <div class="hist" id="cmdHist"></div>
      </section>`,
    serverlogs: () => `
      <div class="pills" id="logPills"></div>
      <section class="panel logs"><div class="feed" id="logList"></div><div class="log-more" id="logMore" hidden></div></section>`,
    bans: () => `<div id="banList"></div>`,
    livemap: () => `
      <div class="lm">
        <aside class="lm-side">
          <div class="lm-head">
            <h2>Live map</h2>
            <p id="lmSub"></p>
            <label class="search">${ico("search")}<input id="lmSearch" type="search" placeholder="Find a player…" autocomplete="off" aria-label="Find a player"></label>
            <div class="pills" id="lmPills"></div>
          </div>
          <div class="lm-list" id="lmList"></div>
        </aside>
        <div class="lm-map" id="lmMap" tabindex="0" aria-label="Map. Arrow keys pan, plus and minus zoom.">
          <div class="lm-stage" id="lmStage">
            <img id="lmImg" src="${esc(MAP_URL)}" alt="ER:LC map" draggable="false" referrerpolicy="no-referrer">
            <div id="lmLayer"></div>
          </div>
          <div class="lm-note" id="lmNote" hidden></div>
          <div class="lm-ctrl">
            <div class="lm-grp">
              <button class="lm-btn" id="lmGrid" type="button" aria-label="Toggle grid" aria-pressed="true">${ico("hash")}</button>
              <button class="lm-btn" id="lmReset" type="button" aria-label="Reset view">${ico("target")}</button>
            </div>
            <div class="lm-grp">
              <button class="lm-btn" id="lmIn" type="button" aria-label="Zoom in">${ico("plus")}</button>
              <button class="lm-btn" id="lmOut" type="button" aria-label="Zoom out">${ico("minus")}</button>
              <button class="lm-btn" id="lmFull" type="button" aria-label="Fullscreen">${ico("expand")}</button>
            </div>
          </div>
          <div class="lm-card" id="lmCard" hidden></div>
          <div class="lm-coords" id="lmCoords" hidden></div>
          <div class="lm-credit">Map: ER:LC</div>
        </div>
      </div>`,
    moderations: () => `
      <div class="filter-row">
        <div class="pills" id="modPills" style="margin:0"></div>
        <label class="only-mine"><span class="switch"><input type="checkbox" id="onlyMine"><i></i></span>Only mine</label>
        <span class="spacer"></span>
        <label class="search">${ico("search")}<input id="modSearch" type="search" placeholder="Player, reason or MOD-…" autocomplete="off" aria-label="Search moderations"></label>
      </div>
      <div id="modList"></div>`,
    players: () => `
      <div class="pills" id="pills"></div>
      <div class="table-wrap">
        <table class="players">
          <thead><tr><th>Player</th><th>Team</th><th>Callsign</th><th>Location</th><th>Permission</th></tr></thead>
          <tbody id="playerRows"></tbody>
        </table>
      </div>`,
    overview: () => {
      const cards = STATS.map(s => `
        <div class="stat ${s.label === "Mod calls" && +s.value > 0 ? "hot" : ""}" style="--tint:${s.tint}">
          <div class="stat-top"><span>${s.label}</span><span class="stat-icon">${ico(s.icon)}</span></div>
          <div class="stat-value">${esc(s.value)}</div>
          <div class="stat-note">${esc(s.note)}</div>
        </div>`).join("");

      const feed = SERVER_LOGS.length
        ? `<div class="feed">${SERVER_LOGS.slice(0, 8).map(l => logRow(l, false)).join("")}</div>`
        : empty("pulse", "No activity yet");

      const shift = ACTIVE_SHIFTS.length
        ? `<div class="feed">${ACTIVE_SHIFTS.map(m => `<div class="row">${avatarHtml(m.name, m.avatar)}<span class="row-text"><b>${esc(m.name)}</b>${m.onBreak ? " (on break)" : ""}</span><span class="row-time">${esc(timeAgo(m.started))}</span></div>`).join("")}</div>`
        : empty("shifts", "Nobody is on shift");

      const mods = MODERATIONS.length
        ? `<div class="feed">${MODERATIONS.slice(0, 5).map(m => `<div class="row"><span class="row-text"><b>${esc(m.mod)}</b> ${esc(typeById(m.type).verb)} <b>${esc(m.user)}</b></span><span class="row-time">${esc(timeAgo(m.at))}</span></div>`).join("")}</div>`
        : empty("moderations", "No moderations logged yet");

      const calls = MOD_CALLS.length
        ? `<div class="feed">${MOD_CALLS.map(c => `<div class="row call">${robloxAvatar(c.user, c.id)}<span class="row-text"><b>${esc(c.user)}</b><small>Needs a moderator</small></span><span class="call-wait">${ico("phone")}${esc(timeAgo(c.at))}</span></div>`).join("")}</div>`
        : empty("phone", "No mod calls");

      return `
        <div class="stats">${cards}</div>
        <div class="grid">
          ${panel("Live activity", "pulse", { href: "#serverlogs", text: "View all" }, feed, "tall")}
          ${panel("On shift", "shifts", { href: "#shifts", text: "View all" }, shift, "tall")}
        </div>
        <div class="grid">
          ${panel("Recent moderations", "moderations", { href: "#moderations", text: "View all" }, mods, "short")}
          ${panel("Mod calls", "phone", null, calls, "short")}
        </div>`;
    }
  };
  // ----------------------------------------

  const sidebar = document.getElementById("sidebar");
  let flat = NAV.flatMap(g => g.items);

  sidebar.innerHTML = `
    <div class="side-top">
      <span class="side-name"><img src="/logo.webp" alt="" width="28" height="28"><span class="lbl">Chicago Moderation</span></span>
      <button class="side-toggle" id="sideToggle" type="button" aria-expanded="true" aria-label="Close sidebar" title="Close sidebar">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS.sidebar}</svg>
      </button>
    </div>` + NAV.map(g => `
    <div class="group">
      <div class="group-label">${g.group}</div>
      ${g.items.map(i => `
        <a class="item" href="#${i.id}" data-id="${i.id}" title="${i.label}">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[i.id]}</svg>
          <span class="lbl">${i.label}</span>
        </a>`).join("")}
    </div>`).join("") + `
    <button class="item logout" id="logout" type="button">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS.logout}</svg>
      <span class="lbl">Log out</span>
    </button>`;

  // Collapses the sidebar to icons; remembered per browser.
  const setSide = closed => {
    document.body.classList.toggle("side-closed", closed);
    const t = document.getElementById("sideToggle");
    t.setAttribute("aria-expanded", String(!closed));
    t.title = closed ? "Open sidebar" : "Close sidebar";
    t.setAttribute("aria-label", t.title);
    try { localStorage.setItem("sideClosed", closed ? "1" : ""); } catch {}
  };
  try { setSide(localStorage.getItem("sideClosed") === "1"); } catch {}

  let teardown = null, shownPage = null;
  function show(id) {
    const page = flat.find(p => p.id === id) || flat.find(p => p.id === DEFAULT_PAGE) || flat[0];
    document.querySelectorAll(".item").forEach(b => { const on = b.dataset.id === page.id; b.classList.toggle("active", on); on ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"); if (on) b.scrollIntoView({ block: "nearest", inline: "nearest" }); });
    if (teardown) { teardown(); teardown = null; }
    document.querySelector(".content").classList.toggle("flush", !!(HEADINGS[page.id] && HEADINGS[page.id]().flush));
    const head = HEADINGS[page.id] ? HEADINGS[page.id]() : { title: page.label, sub: page.sub };
    document.getElementById("title").innerHTML = head.title;
    document.getElementById("sub").innerHTML = head.sub;
    document.getElementById("headTools").innerHTML = head.tools || "";
    document.getElementById("view").innerHTML = (PAGES[page.id] || (() => '<div class="placeholder">Coming soon.</div>'))();
    if (AFTER[page.id]) { const cleanup = AFTER[page.id](); if (typeof cleanup === "function") teardown = cleanup; }
    document.title = page.label + " | Chicago Moderation";
    // animate only when the page actually changes, not when the same page re-renders with fresh data
    if (page.id !== shownPage) {
      [document.getElementById("view"), document.querySelector(".page-head")].forEach(el => {
        el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
      });
    }
    shownPage = page.id;
  }

  sidebar.addEventListener("click", e => {
    if (e.target.closest("#sideToggle")) return setSide(!document.body.classList.contains("side-closed"));
    const btn = e.target.closest(".item");
    if (btn && btn.id === "logout") api("/auth/logout", {}).finally(() => { location.href = "/login"; });
  });

  // ---------- load data from backend.py ----------
  const loadPlayers = async () => {
    PLAYERS.splice(0, PLAYERS.length, ...normalizePlayers(await api("/api/players"))
      .map(p => ({ ...p, location: [p.postal ? "Postal " + p.postal : "", p.street].filter(Boolean).join(" · ") || "–" })));
  };
  const loadState = async () => {
    const s = await api("/api/state");
    if (s.overview) {
      const o = s.overview, st = o.staff;
      MAX_PLAYERS = o.maxPlayers; SERVER_NAME = o.name;
      const set = (i, value, note) => Object.assign(STATS[i], { value: String(value), note });
      set(0, o.erlcOk ? `${o.players}/${o.maxPlayers}` : "–", o.erlcOk ? `${o.onTeam} on a team` : o.error);
      set(1, o.queue, "");
      set(2, st.total, `${st.admin} admin · ${st.mod} mod · ${st.helper} helper`);
      set(3, o.modCalls.length, o.modCalls.length ? "waiting for a moderator" : "");
      set(4, o.logsToday, "");
      set(5, o.bolos, "");
      MOD_CALLS.splice(0, MOD_CALLS.length, ...o.modCalls);
    }
    if (s.moderations) MODERATIONS.splice(0, MODERATIONS.length, ...s.moderations);
    if (s.shifts) setShifts(s.shifts);
    if (s.staff) STAFF.splice(0, STAFF.length, ...s.staff);
    if (s.roles) ROLES = s.roles;
    if (s.commands) COMMAND_HISTORY.splice(0, COMMAND_HISTORY.length, ...s.commands);
    if (flat.some(p => p.id === "serverlogs")) SERVER_LOGS.splice(0, SERVER_LOGS.length, ...await api(LOGS_ENDPOINT));
  };

  (async () => {
    let me;
    try { me = await api("/api/me"); }
    catch (e) {
      document.getElementById("title").textContent = "Couldn't load panel";
      document.getElementById("view").innerHTML = `<div class="placeholder">${esc(e.message)}</div>`;
      document.querySelectorAll(".group").forEach(g => g.remove());
      return;
    }
    USERNAME = me.name; USER_AVATAR = me.avatar; USER_ID = me.id;
    USER_PERMS = me.perms; applyConfig(me.config);
    flat = flat.filter(p => me.pages.includes(p.id));
    document.querySelectorAll(".item[data-id]").forEach(b => { if (!me.pages.includes(b.dataset.id)) b.remove(); });
    document.querySelectorAll(".group").forEach(g => { if (!g.querySelector(".item")) g.remove(); });

    await Promise.all([loadState().catch(() => {}), me.pages.includes("players") && loadPlayers().catch(() => {})]);
    show(location.hash.slice(1));
    window.addEventListener("hashchange", () => show(location.hash.slice(1)));

    // Keep shared data fresh. Only pages without inputs are redrawn, so typing isn't interrupted.
    setInterval(async () => {
      await Promise.all([loadState().catch(() => {}), me.pages.includes("players") && loadPlayers().catch(() => {})]);
      if (location.hash.slice(1) === "overview" || !location.hash) show("overview");
    }, 15000);
  })();
