"""
Staff panel backend (Flask + SQLite)

What it does
  - Discord sign-in. Only people with the access role (ACCESS_ROLE_ID) get in; it's re-checked every few minutes.
    What each person can do comes from panel roles, created on the Roles page and set up in Settings.
  - Stores moderation logs, shifts, strikes, command history and server logs in one SQLite file, so every
    staff member sees the same data.
  - Talks to ER:LC for you (players, bans, logs, commands) so your server key never reaches the browser.
  - Serves index.html at "/".

Run it
  pip install flask requests
  python backend.py

Fill in the CONFIG section below first. Secrets come from environment variables, not this file:
  SECRET_KEY, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN, ERLC_SERVER_KEY (optional), ERLC_GLOBAL_KEY (optional)
"""
import base64
import copy
import hashlib
import json
import os
import math
import re
import secrets
import sqlite3
import threading
import time
from contextlib import closing
from datetime import date, datetime, timedelta, timezone
from functools import wraps
from urllib.parse import quote, urlencode

import requests
from flask import Flask, g, jsonify, redirect, request, send_from_directory, session

# Load KEY=value lines from .env next to this file. Real environment variables win.
_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(_env):
    with open(_env, encoding="utf-8-sig") as f:   # -sig: Windows Notepad adds a BOM that would corrupt the first key
        for line in f:
            k, sep, v = line.strip().partition("=")
            if sep and not k.startswith("#"):
                os.environ.setdefault(k.strip(), v.strip())

# =====================================================================================
# CONFIG
# =====================================================================================
PORT = 3000
SITE_URL = "https://refugees-christine-between-christmas.trycloudflare.com"    # public address of the site, no trailing slash (use https:// when live)
SECRET_KEY = os.environ["SECRET_KEY"]   # signs login cookies; make it long and random
DB_PATH = "panel.db"
STATIC_DIR = "."                          # folder holding index.html and an optional img/ folder

# Discord application (discord.com/developers). Add SITE_URL + "/auth/callback" under OAuth2 > Redirects.
DISCORD_CLIENT_ID = "1513580238997815526"
DISCORD_CLIENT_SECRET = os.environ["DISCORD_CLIENT_SECRET"]
DISCORD_BOT_TOKEN = os.environ["DISCORD_BOT_TOKEN"]           # the bot must be in your server
DISCORD_GUILD_ID = "1534782642262769744"

# Only people with this Discord role can sign in and show up on the staff list. Listing staff needs the bot's
# "Server Members Intent" turned on. What each person can do comes from panel roles (Roles page), not Discord.
ACCESS_ROLE_ID = "1558707561618997258"
# Discord user IDs that can always do everything, whatever their panel roles, so nobody gets locked out.
OWNER_IDS = ["1374931077801709669", "1498514468252942436", "1536879503421345932"]   # Knightwolf2434, Marcus1290148, stormz5m

# Roblox verification (the /verify page). In the Roblox Creator Dashboard (OAuth 2.0 app), add SITE_URL + "/verify/callback"
# as a redirect URL and use the scopes "openid" and "profile". Put ROBLOX_CLIENT_SECRET and SUPABASE_SECRET_KEY in .env.
ROBLOX_CLIENT_ID = "4264543479636622924"   # your Roblox OAuth app's client ID
ROBLOX_CLIENT_SECRET = os.environ.get("ROBLOX_CLIENT_SECRET", "")
SUPABASE_URL = "https://oyklenlxfczmdihruqnl.supabase.co"   # Project Settings > API
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY") or os.environ.get("SUPABASE_SERVICE_KEY", "")   # secret key: backend only, never put it in a web page
VERIFIED_ROLE_ID = "1555751134549778553"                     # Discord role given on verify (leave empty to skip)
UNVERIFIED_ROLE_ID = "1555769269952712744"                   # Discord role removed on verify (leave empty to skip)
SET_NICKNAME_TO_ROBLOX = True             # also set their server nickname to their Roblox username

# ER:LC
ERLC_SERVER_KEY = os.environ.get("ERLC_SERVER_KEY", "") # Server Settings > API in ER:LC
ERLC_GLOBAL_KEY = os.environ.get("ERLC_GLOBAL_KEY", "") # optional, only if ER:LC gave you one
ERLC_V2 = "https://api.erlc.gg/v2"
ERLC_V1 = "https://api.erlc.gg/v1"
ERLC_CACHE_SECONDS = 5                    # everyone shares one ER:LC call per this many seconds
ERLC_COMMAND_COOLDOWN = 5                 # ER:LC allows one command every 5 seconds
LOG_POLL_SECONDS = 10                     # how often new join/leave/kill/command/mod call logs are saved
LOG_RETENTION_DAYS = 14
COMMAND_RETENTION_DAYS = 30

# Commands that hand out admin/mod powers or shut the server down can only be run in game.
BLOCKED_COMMANDS = [":admin", ":unadmin", ":mod", ":unmod", ":helper", ":unhelper", ":shutdown"]

# When someone logs a Kick, Ban, or Warning (with the PM switch on), also send it to the game.
AUTO_ERLC_ACTIONS = True

# Automated messages (Automated messages page): the ER:LC command each type is sent with, and the shortest interval allowed.
AUTOMATED_TYPES = {"hint": ":h", "announcement": ":m"}
AUTOMATED_MIN_MINUTES = 5

# Every moderation logged on the panel is also posted to this Discord channel by the bot.
MOD_LOG_CHANNEL_ID = "1555751530014052402"
MOD_LOG_ICON_URL = "https://media.discordapp.net/attachments/1558649202639376435/1558663279352614932/OSRP_LOGO.png?ex=6ad42acc&is=6ad2d94c&hm=f6687af5eb08682883ca7e328c463e43c1ce5284ce0517dc7a49cf8245de041b&=&format=webp&quality=lossless&width=384&height=384"
MOD_TYPE_LABELS = {"warning": "Warning", "kick": "Kick", "ban": "Ban", "tempban": "Temp Ban", "bolo": "Ban BOLO", "note": "Note"}

# Discord Integration pages (Nicknames, Channels, Roles). The choices are saved from the panel; nothing here needs editing.
DISCORD_CHANNEL_KEYS = ["shift", "moderation", "loa", "reviews", "promotion", "demotion"]
DISCORD_ROLE_KEYS = ["shift", "break", "loa"]
# Log groups that can be split up: each type can go to its own channel instead of the group's channel.
DISCORD_OVERRIDES = {
    "shift": [("start", "Shift started"), ("break", "Shift break"), ("end", "Shift ended")],
    "moderation": list(MOD_TYPE_LABELS.items()),
    "loa": [("submitted", "Submitted"), ("result", "Approved or denied"), ("ended", "Ended")],
}
OVERRIDE_KEYS = {f"{g}.{k}" for g, items in DISCORD_OVERRIDES.items() for k, _ in items}
SNOWFLAKE_RE = re.compile(r"^\d{15,25}$")

# Every permission a panel role can have, with the old rank each one started at. The rank is only used once,
# to build the first Owner/Admin/Mod/Helper roles; after that, roles are edited on the Settings page.
SEED_PERMISSIONS = {
    "overview.view": "helper",
    "players.view": "helper",
    "livemap.view": "helper",
    "moderations.view": "helper",
    "bans.view": "mod",
    "bans.remove": "admin",
    "logs.view": "helper",
    "logs.clear": "owner",
    "moderations.delete": "admin",
    "commands.run": "mod",
    "automated.manage": "admin",
    "discord.manage": "owner",
    "staff.view": "helper",
    "staff.manage": "admin",
    "shifts.use": "helper",
    "roles.assign": "admin",
    "settings.manage": "owner",
}
PAGE_PERMS = {
    "overview": "overview.view", "players": "players.view", "livemap": "livemap.view",
    "moderations": "moderations.view", "bans": "bans.view", "serverlogs": "logs.view",
    "commands": "commands.run", "automated": "automated.manage", "staff": "staff.view", "shifts": "shifts.use", "quotas": "shifts.use",
    "settings": "settings.manage", "roles": "settings.manage",
    "dnick": "discord.manage", "dchan": "discord.manage", "drole": "discord.manage",
}
# Rank each moderation type started at (seed only, like SEED_PERMISSIONS). Logging one needs the "log.<type>" permission.
SEED_MOD_LEVELS = {"warning": "helper", "note": "helper", "kick": "mod", "ban": "mod", "tempban": "mod", "bolo": "mod"}

# Weekly shift-hour goals per panel role id (0 = no goal). Changed on the Quotas page.
QUOTAS = {"enabled": False, "since": 0, "hours": {}}
MAX_LEAVE_DAYS = 60

MAX_STRIKES = 3
MAX_ON_SHIFT = 0                          # most people on shift at once (0 = no limit). Owners can change it in Settings.
SHIFT_GRACE_SECONDS = 120                 # a shift ends on its own after the person has been out of the game this long
RECHECK_SECONDS = 300                     # how often a signed-in person's Discord access role is checked again
STAFF_CACHE_SECONDS = 60

# For testing on your own computer only. Set to {"id": "1", "name": "you", "avatar": ""} to skip Discord sign-in
# (put that id in OWNER_IDS for full access). MUST be None on the live site.
DEV_BYPASS_USER = None
# =====================================================================================

DISCORD_API = "https://discord.com/api/v10"
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
MOD_TYPES = set(SEED_MOD_LEVELS)
ALL_PERMS = list(SEED_PERMISSIONS) + [f"log.{t}" for t in SEED_MOD_LEVELS]
OWNER_POWER = 10 ** 6                     # beats any role position

app = Flask(__name__)
app.config.update(
    SECRET_KEY=SECRET_KEY,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=SITE_URL.startswith("https://"),
    PERMANENT_SESSION_LIFETIME=timedelta(days=7),
)


# ------------------------------------------------------------------------------ database
def db():
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def rows(sql, args=()):
    with closing(db()) as c:
        return [dict(r) for r in c.execute(sql, args).fetchall()]


def run(sql, args=()):
    with closing(db()) as c:
        cur = c.execute(sql, args)
        c.commit()
        return cur.lastrowid


def init_db():
    with closing(db()) as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS moderations (
            id TEXT PRIMARY KEY, type TEXT, user TEXT, reason TEXT, evidence TEXT, duration TEXT,
            pm INTEGER, mod_id TEXT, mod_name TEXT, mod_avatar TEXT, status TEXT, at INTEGER);
        CREATE INDEX IF NOT EXISTS moderations_at ON moderations(at);
        CREATE TABLE IF NOT EXISTS shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, user_name TEXT, avatar TEXT,
            started INTEGER, ended INTEGER, break_ms INTEGER DEFAULT 0, on_break INTEGER DEFAULT 0,
            break_started INTEGER DEFAULT 0, revoked INTEGER DEFAULT 0, logs INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT, command TEXT, ok INTEGER, error TEXT, user_name TEXT, at INTEGER);
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT, dedupe TEXT UNIQUE, type TEXT, user TEXT, cmd TEXT,
            target TEXT, text TEXT, at INTEGER);
        CREATE INDEX IF NOT EXISTS logs_at ON logs(at);
        CREATE TABLE IF NOT EXISTS strikes (user_id TEXT PRIMARY KEY, count INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS staff (
            user_id TEXT PRIMARY KEY, name TEXT, handle TEXT, avatar TEXT, rank TEXT, first_seen INTEGER);
        CREATE TABLE IF NOT EXISTS staff_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, text TEXT, by_name TEXT, at INTEGER);
        CREATE INDEX IF NOT EXISTS staff_events_user ON staff_events(user_id, at);
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, color TEXT, position INTEGER, perms TEXT);
        CREATE TABLE IF NOT EXISTS user_roles (user_id TEXT, role_id INTEGER, PRIMARY KEY (user_id, role_id));
        CREATE TABLE IF NOT EXISTS leave (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, user_name TEXT, start TEXT, end TEXT, reason TEXT,
            status TEXT, decided_by TEXT, at INTEGER);
        CREATE TABLE IF NOT EXISTS automated_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, interval_min INTEGER, message TEXT, erlc INTEGER DEFAULT 1,
            type TEXT, min_players INTEGER DEFAULT 0, last_sent INTEGER DEFAULT 0, created_at INTEGER);
        """)
        # columns added after the first release; ALTER fails harmlessly once they exist
        for col in ("adjust_ms INTEGER DEFAULT 0", "manual INTEGER DEFAULT 0", "revoked_by TEXT"):
            try:
                c.execute("ALTER TABLE shifts ADD COLUMN " + col)
            except sqlite3.OperationalError:
                pass
        c.commit()


init_db()


def now_ms():
    return int(time.time() * 1000)


# ------------------------------------------------------------------------------ small cache
_cache, _cache_lock = {}, threading.Lock()


def cached(key, ttl, fn):
    now = time.time()
    with _cache_lock:
        hit = _cache.get(key)
        if hit and now - hit[0] < ttl:
            return hit[1]
    val = fn()
    with _cache_lock:
        _cache[key] = (now, val)
    return val


def forget(key):
    with _cache_lock:
        _cache.pop(key, None)


# ------------------------------------------------------------------------------ Discord
def bot_headers(reason=None):
    h = {"Authorization": "Bot " + DISCORD_BOT_TOKEN}
    if reason:
        h["X-Audit-Log-Reason"] = quote(reason)
    return h


def discord_member(user_id):
    """(status_code, member_json_or_None)"""
    try:
        r = requests.get(f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/members/{user_id}", headers=bot_headers(), timeout=10)
    except requests.RequestException:
        return 0, None
    return r.status_code, (r.json() if r.status_code == 200 else None)


def has_access(user_id, member):
    return user_id in OWNER_IDS or ACCESS_ROLE_ID in [str(r) for r in member.get("roles", [])]


# ------------------------------------------------------------------------------ panel roles
def role_rows():
    return [dict(r, perms=json.loads(r["perms"] or "[]")) for r in rows("SELECT * FROM roles ORDER BY position DESC")]


def user_access(uid):
    """(permissions, power). Power is the person's highest role position; someone can only manage people below them."""
    if uid in OWNER_IDS:
        return set(ALL_PERMS), OWNER_POWER
    rs = rows("SELECT r.position, r.perms FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id=?", (uid,))
    perms = set()
    for r in rs:
        perms.update(json.loads(r["perms"] or "[]"))
    return perms & set(ALL_PERMS), max((r["position"] for r in rs), default=0)


def with_roles(members):
    """Copies of members with roleIds (highest first) and power filled in from the panel roles."""
    pos = {r["id"]: r["position"] for r in rows("SELECT id, position FROM roles")}
    links = {}
    for r in rows("SELECT user_id, role_id FROM user_roles"):
        if r["role_id"] in pos:
            links.setdefault(r["user_id"], []).append(r["role_id"])
    out = []
    for m in members:
        ids = sorted(links.get(m["id"], []), key=lambda i: -pos[i])
        power = OWNER_POWER if m["id"] in OWNER_IDS else (pos[ids[0]] if ids else 0)
        out.append(dict(m, roleIds=ids, power=power))
    return out


def seed_roles():
    """First run after the switch from Discord ranks: build Owner/Admin/Mod/Helper roles from the saved rank settings
    and give each staff member the role matching their last known rank."""
    if rows("SELECT 1 FROM settings WHERE key='roles_seeded'") or rows("SELECT 1 FROM roles LIMIT 1"):
        return
    saved = rows("SELECT value FROM settings WHERE key='panel'")
    try:
        saved = json.loads(saved[0]["value"]) if saved else {}
    except ValueError:
        saved = {}
    rank_n = {"helper": 1, "mod": 2, "admin": 3, "owner": 4}
    levels = {**SEED_PERMISSIONS, **(saved.get("permissions") or {})}
    mods = {**SEED_MOD_LEVELS, **(saved.get("modTypeLevels") or {})}
    ids = {}
    for key, name, color in (("owner", "Owner", "#f5a623"), ("admin", "Admin", "#a855f7"), ("mod", "Mod", "#22c55e"), ("helper", "Helper", "#22b8cf")):
        n = rank_n[key]
        perms = [p for p in ALL_PERMS if p in levels and rank_n.get(levels[p], 4) <= n] + \
                [f"log.{t}" for t in SEED_MOD_LEVELS if rank_n.get(mods.get(t), 4) <= n]
        ids[key] = run("INSERT INTO roles (name, color, position, perms) VALUES (?,?,?,?)", (name, color, n, json.dumps(perms)))
    for r in rows("SELECT user_id, rank FROM staff"):
        if r["rank"] in ids:
            run("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?,?)", (r["user_id"], ids[r["rank"]]))
    hours = (saved.get("quotas") or {}).get("hours") or {}
    if saved:
        saved.setdefault("quotas", {})["hours"] = {str(ids[k]): v for k, v in hours.items() if k in ids}
        run("UPDATE settings SET value=? WHERE key='panel'", (json.dumps(saved),))
    run("INSERT INTO settings (key, value) VALUES ('roles_seeded', '1')")


def display_name(member):
    u = member.get("user", {})
    # the shift / LOA nickname prefix is removed, so a person's name stays the same on and off shift
    return strip_prefixes(member.get("nick") or u.get("global_name") or u.get("username") or "Unknown")


def avatar_url(user):
    h = user.get("avatar")
    return f"https://cdn.discordapp.com/avatars/{user['id']}/{h}.png?size=64" if h else ""


def current_user():
    u = dict(DEV_BYPASS_USER) if DEV_BYPASS_USER else session.get("user")
    if not u:
        return None
    if not DEV_BYPASS_USER and time.time() - u.get("checked", 0) > RECHECK_SECONDS:
        status, member = discord_member(u["id"])
        if status == 200:
            if not has_access(u["id"], member):
                session.clear()
                return None
            u = dict(u, name=display_name(member), checked=time.time())
            session["user"] = u
        elif status == 404:
            session.clear()
            return None
        # if Discord is unreachable, keep the existing session for now
    perms, power = user_access(u["id"])
    return dict(u, perms=perms, power=power)


def auth(perm=None):
    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **k):
            if request.method not in ("GET", "HEAD") and request.headers.get("X-Requested-With") != "panel":
                return jsonify(error="Bad request."), 403
            u = current_user()
            if not u:
                return jsonify(error="Sign in required."), 401
            if perm and not allowed(u, perm):
                return jsonify(error="You don't have permission to do that."), 403
            g.user = u
            return fn(*a, **k)
        return wrapper
    return deco


def allowed(u, perm):
    return perm in u["perms"]


def callback_url():
    # Local visits come back to localhost; everything else (e.g. the tunnel) uses SITE_URL.
    # Discord only accepts redirect URIs registered in the dev portal, so a forged Host header can't redirect elsewhere.
    if request.host.split(":")[0] in ("localhost", "127.0.0.1"):
        return request.host_url + "auth/callback"
    return SITE_URL + "/auth/callback"


@app.get("/auth/login")
def auth_login():
    state = secrets.token_urlsafe(24)
    session["oauth_state"] = state
    session["oauth_mode"] = "public" if request.args.get("mode") == "public" else "staff"
    nxt = {"start": "/verify/start"}.get(request.args.get("next"))   # only these places can be returned to
    if nxt:
        session["oauth_next"] = nxt
    return redirect("https://discord.com/oauth2/authorize?" + urlencode({
        "client_id": DISCORD_CLIENT_ID, "redirect_uri": callback_url(),
        "response_type": "code", "scope": "identify", "state": state, "prompt": "none"}))


@app.get("/auth/callback")
def auth_callback():
    mode = session.pop("oauth_mode", "staff")
    nxt = session.pop("oauth_next", "/")
    bad = "/?error=login" if mode == "public" else "/login?error=login"
    code = request.args.get("code")
    if not code or not request.args.get("state") or request.args.get("state") != session.pop("oauth_state", None):
        return redirect(bad)
    try:
        t = requests.post(f"{DISCORD_API}/oauth2/token", data={
            "client_id": DISCORD_CLIENT_ID, "client_secret": DISCORD_CLIENT_SECRET, "grant_type": "authorization_code",
            "code": code, "redirect_uri": callback_url()},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        if t.status_code != 200:
            return redirect(bad)
        me = requests.get(f"{DISCORD_API}/users/@me", headers={"Authorization": "Bearer " + t.json()["access_token"]}, timeout=10)
        if me.status_code != 200:
            return redirect(bad)
    except (requests.RequestException, KeyError, ValueError):
        return redirect(bad)
    user = me.json()
    status, member = discord_member(user["id"])
    if mode == "public":   # sign-in from the home page: anyone can sign in; staff also get panel access
        session.clear()
        session.permanent = True
        session["pub"] = {"id": user["id"], "username": user.get("global_name") or user.get("username") or "Player",
                          "avatar": avatar_url(user)}
        if status == 200 and has_access(user["id"], member):
            session["user"] = {"id": user["id"], "name": display_name(member), "avatar": avatar_url(user),
                               "checked": time.time()}
        return redirect(nxt)
    if status == 404:
        return redirect("/login?error=noaccess")
    if status != 200:
        return redirect(bad)
    if not has_access(user["id"], member):
        return redirect("/login?error=noaccess")
    session.clear()
    session.permanent = True
    session["user"] = {"id": user["id"], "name": display_name(member), "avatar": avatar_url(user),
                       "checked": time.time()}
    session["pub"] = {"id": user["id"], "username": user.get("global_name") or user.get("username") or "Player",
                      "avatar": avatar_url(user)}
    return redirect("/panel")


@app.post("/auth/logout")
def auth_logout():
    session.clear()
    return jsonify(ok=True)


@app.get("/api/me")
@auth()
def api_me():
    u = g.user
    perms = [p for p in ALL_PERMS if allowed(u, p)]
    return jsonify(id=u["id"], name=u["name"], avatar=u.get("avatar", ""), owner=u["id"] in OWNER_IDS,
                   perms=perms, pages=[p for p, perm in PAGE_PERMS.items() if perm in perms],
                   config={"blockedCommands": BLOCKED_COMMANDS, "logRetentionDays": LOG_RETENTION_DAYS,
                           "commandRetentionDays": COMMAND_RETENTION_DAYS, "maxStrikes": MAX_STRIKES,
                           "roles": public_roles()})


# ------------------------------------------------------------------------------ ER:LC
def erlc_headers():
    h = {"server-key": ERLC_SERVER_KEY, "Accept": "application/json"}
    if ERLC_GLOBAL_KEY:
        h["Authorization"] = ERLC_GLOBAL_KEY
    return h


def erlc_error(r):
    try:
        j = r.json()
        msg = j.get("message") or j.get("error")
    except ValueError:
        msg = None
    return msg or f"ER:LC answered {r.status_code}."


def erlc_get(path, params=None, base=None):
    """(json, None) on success or (None, error_text)"""
    if not ERLC_SERVER_KEY:
        return None, "The ER:LC server key isn't set yet."
    try:
        r = requests.get((base or ERLC_V2) + path, params=params, headers=erlc_headers(), timeout=10)
    except requests.RequestException:
        return None, "Couldn't reach ER:LC."
    if r.status_code == 200:
        try:
            return r.json(), None
        except ValueError:
            return None, "ER:LC sent something unreadable."
    return None, erlc_error(r)


def erlc_snapshot():
    return cached("server", ERLC_CACHE_SECONDS, lambda: erlc_get(
        "/server", {"Players": "true", "Staff": "true", "Queue": "true", "ModCalls": "true"}))


def split_player(s):
    name, _, pid = str(s or "").partition(":")
    return (name or "Unknown"), pid


_cmd_lock, _last_cmd = threading.Lock(), 0.0


def send_erlc_command(cmd, who, record=True):
    """(ok, error). Records the attempt in the history unless we're just waiting out the cooldown.
    record=False keeps automated messages out of the Commands history so they don't bury what staff ran."""
    global _last_cmd
    if not ERLC_SERVER_KEY:
        return False, "The ER:LC server key isn't set yet."
    with _cmd_lock:
        wait = ERLC_COMMAND_COOLDOWN - (time.time() - _last_cmd)
        if wait > 0:
            return False, f"ER:LC takes one command every {ERLC_COMMAND_COOLDOWN} seconds. Try again in {math.ceil(wait)}s."
        _last_cmd = time.time()
    ok, err = False, ""
    try:
        r = requests.post(ERLC_V2 + "/server/command", json={"command": cmd}, headers=erlc_headers(), timeout=10)
        ok = r.status_code == 200
        if not ok:
            err = erlc_error(r)
    except requests.RequestException:
        err = "Couldn't reach ER:LC."
    if record:
        run("INSERT INTO commands (command, ok, error, user_name, at) VALUES (?,?,?,?,?)", (cmd, int(ok), err, who, now_ms()))
    return ok, err


# ------------------------------------------------------------------------------ server logs (saved from ER:LC)
def ingest_logs():
    d, err = erlc_get("/server", {"JoinLogs": "true", "KillLogs": "true", "CommandLogs": "true", "ModCalls": "true"})
    if err or not isinstance(d, dict):
        return
    items = []
    for j in d.get("JoinLogs") or []:
        name, _ = split_player(j.get("Player"))
        items.append(("join" if j.get("Join") else "leave", name, "", "", "", j.get("Timestamp")))
    for k in d.get("KillLogs") or []:
        killer, _ = split_player(k.get("Killer"))
        killed, _ = split_player(k.get("Killed"))
        items.append(("kill", killer, "", killed, "", k.get("Timestamp")))
    for c in d.get("CommandLogs") or []:
        name, _ = split_player(c.get("Player"))
        items.append(("command", name, str(c.get("Command") or ""), "", "", c.get("Timestamp")))
    for m in d.get("ModCalls") or []:
        name, _ = split_player(m.get("Caller"))
        items.append(("modcall", name, "", "", "", m.get("Timestamp")))
    cleared = logs_cleared_at()
    with closing(db()) as c:
        for typ, user, cmd, target, text, ts in items:
            if not isinstance(ts, (int, float)):
                continue
            at = int(ts * 1000)
            if at <= cleared:   # ER:LC keeps sending recent logs; don't bring cleared ones back
                continue
            c.execute("INSERT OR IGNORE INTO logs (dedupe, type, user, cmd, target, text, at) VALUES (?,?,?,?,?,?,?)",
                      (f"{typ}|{at}|{user}|{cmd or target}", typ, user, cmd, target, text, at))
        c.commit()


def logs_cleared_at():
    r = rows("SELECT value FROM settings WHERE key='logs_cleared'")
    return int(r[0]["value"]) if r else 0


def prune_logs():
    now = now_ms()
    run("DELETE FROM logs WHERE (type='command' AND at < ?) OR (type!='command' AND at < ?)",
        (now - COMMAND_RETENTION_DAYS * 86400000, now - LOG_RETENTION_DAYS * 86400000))


def run_automated_messages():
    """Sends the next automated message that is due. Only one goes out per pass, so ER:LC's one-command-per-5-seconds
    limit is respected. Nothing is sent unless at least one person is on shift and the server has enough players."""
    if not ERLC_SERVER_KEY:
        return
    now = now_ms()
    due = [m for m in rows("SELECT * FROM automated_messages WHERE erlc=1 ORDER BY last_sent")
           if now - (m["last_sent"] or 0) >= m["interval_min"] * 60000]
    if not due or not rows("SELECT 1 FROM shifts WHERE ended IS NULL LIMIT 1"):
        return
    d, err = erlc_snapshot()
    if err or not isinstance(d, dict):
        return
    players = d.get("CurrentPlayers", len(d.get("Players") or []))
    for m in due:
        if players < (m["min_players"] or 0):
            continue   # try again next pass; it goes out as soon as enough players are in
        prefix = AUTOMATED_TYPES.get(m["type"])
        if not prefix:
            continue
        ok, err = send_erlc_command(f"{prefix} {m['message']}", "Automated", record=False)
        if not ok and err.startswith("ER:LC takes one command"):
            return   # still in the cooldown after another command; retry on the next pass
        run("UPDATE automated_messages SET last_sent=? WHERE id=?", (now_ms(), m["id"]))
        if not ok:
            print(f"Automated message '{m['name']}' failed:", err)
        return


_bg_started = False


def start_background():
    global _bg_started
    if _bg_started:
        return
    _bg_started = True

    def loop():
        last_prune = 0.0
        while True:
            try:
                ingest_logs()
                check_shifts_in_game()
                run_automated_messages()
                sync_loa()
                if time.time() - last_prune > 3600:
                    prune_logs()
                    last_prune = time.time()
            except Exception as e:  # keep the loop alive
                print("log poller error:", e)
            time.sleep(LOG_POLL_SECONDS)

    threading.Thread(target=loop, daemon=True).start()


# ------------------------------------------------------------------------------ overview
def build_overview():
    d, err = erlc_snapshot()
    d = d if isinstance(d, dict) else {}
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    out = {
        "erlcOk": err is None, "error": err or "", "name": d.get("Name") or "",
        "players": 0, "maxPlayers": d.get("MaxPlayers") or 0, "onTeam": 0, "queue": 0,
        "staff": {"admin": 0, "mod": 0, "helper": 0, "total": 0}, "modCalls": [],
        "logsToday": rows("SELECT COUNT(*) AS n FROM moderations WHERE at >= ?", (int(today.timestamp() * 1000),))[0]["n"],
        "bolos": rows("SELECT COUNT(*) AS n FROM moderations WHERE type='bolo'")[0]["n"],
    }
    players = d.get("Players") or []
    out["players"] = d.get("CurrentPlayers", len(players))
    out["onTeam"] = sum(1 for p in players if (p.get("Team") or "Civilian") != "Civilian")
    out["queue"] = len(d.get("Queue") or [])
    for p in players:
        perm = str(p.get("Permission") or "").lower()
        if "owner" in perm or "admin" in perm:
            out["staff"]["admin"] += 1
        elif "mod" in perm:
            out["staff"]["mod"] += 1
        elif "helper" in perm:
            out["staff"]["helper"] += 1
    out["staff"]["total"] = sum(out["staff"][k] for k in ("admin", "mod", "helper"))
    for m in d.get("ModCalls") or []:
        if not m.get("Moderator") and isinstance(m.get("Timestamp"), (int, float)):
            name, pid = split_player(m.get("Caller"))
            out["modCalls"].append({"user": name, "id": pid, "at": int(m["Timestamp"] * 1000)})
    return out


# ------------------------------------------------------------------------------ moderations
def mod_row(r):
    return {"id": r["id"], "type": r["type"], "user": r["user"], "reason": r["reason"], "evidence": r["evidence"] or "",
            "duration": r["duration"] or "", "pm": bool(r["pm"]), "mod": r["mod_name"], "modAvatar": r["mod_avatar"] or "",
            "status": r["status"], "at": r["at"]}


def new_case_id():
    d = datetime.now(timezone.utc)
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "MOD-%s-%s-%s" % (d.strftime("%Y%m%d"), d.strftime("%H%M%S"), "".join(secrets.choice(chars) for _ in range(4)))


def roblox_id_for(name):
    """Roblox user id for a username, or None. Shares the cache with the avatar lookup."""
    def fetch():
        try:
            r = requests.post("https://users.roblox.com/v1/usernames/users", timeout=10,
                              json={"usernames": [name], "excludeBannedUsers": False})
            uid = ((r.json().get("data") or [{}])[0]).get("id")
        except (requests.RequestException, ValueError, AttributeError):
            return None
        return uid if isinstance(uid, int) else None
    uid = cached(f"robloxid:{name.lower()}", 86400, fetch)
    if not uid:
        forget(f"robloxid:{name.lower()}")
    return uid


def post_mod_log_to_discord(entry, mod_discord_id):
    """Posts the new moderation log to the Discord channel. Runs in the background so the panel isn't slowed down,
    and a Discord failure never breaks logging."""
    def work():
        try:
            prev = rows("SELECT COUNT(*) AS n FROM moderations WHERE LOWER(user)=LOWER(?) AND id!=? AND type!='note'",
                        (entry["user"], entry["id"]))[0]["n"]
            rid = roblox_id_for(entry["user"])
            details = []
            if entry["duration"]:
                details.append(f"**Duration:** {entry['duration']}")
            if entry["evidence"]:
                details.append(f"**Evidence:** {entry['evidence']}")
            payload = {
                "embeds": [{
                    "description": f"Log created by <@{mod_discord_id}>",
                    "color": 16777215,
                    "author": {"name": "Moderation Log Created", "icon_url": MOD_LOG_ICON_URL},
                    "fields": [
                        {"name": "Moderation Type", "value": MOD_TYPE_LABELS.get(entry["type"], entry["type"]), "inline": False},
                        {"name": "Roblox User", "value": f"{entry['user']} ({rid or 'ID not found'})", "inline": False},
                        {"name": "Previous Punishments", "value": str(prev), "inline": False},
                        {"name": "Reason", "value": entry["reason"], "inline": False},
                        {"name": "Description", "value": "\n".join(details) or "No extra details.", "inline": False},
                    ],
                }],
                "components": [{"type": 1, "components": [
                    {"type": 2, "style": 5, "label": "Manage moderation Log", "url": SITE_URL + "/panel#moderations"}]}],
            }
            channel = log_channel("moderation", entry["type"]) or MOD_LOG_CHANNEL_ID   # set on the Channels page; the old setting is the fallback
            r = requests.post(f"{DISCORD_API}/channels/{channel}/messages", headers=bot_headers(), json=payload, timeout=10)
            if r.status_code not in (200, 201):
                print("Mod log post failed:", r.status_code, r.text[:300])
        except Exception as e:
            print("Mod log post error:", repr(e)[:300])
    threading.Thread(target=work, daemon=True).start()


@app.get("/api/moderations")
@auth("moderations.view")
def moderations_list():
    return jsonify([mod_row(r) for r in rows("SELECT * FROM moderations ORDER BY at DESC LIMIT 500")])


@app.post("/api/moderations/<mid>/delete")
@auth("moderations.delete")
def moderations_delete(mid):
    if not rows("SELECT id FROM moderations WHERE id=?", (mid,)):
        return jsonify(error="That log was already deleted."), 404
    run("DELETE FROM moderations WHERE id=?", (mid,))
    return jsonify(ok=True)


@app.post("/api/moderations")
@auth("moderations.view")
def moderations_create():
    d = request.get_json(silent=True) or {}
    t = d.get("type")
    if t not in MOD_TYPES:
        return jsonify(error="Pick a type of log."), 400
    if not allowed(g.user, "log." + t):
        return jsonify(error=f"Your roles can't log a {t}."), 403
    user = str(d.get("user", "")).strip()
    if not USERNAME_RE.match(user):
        return jsonify(error="That doesn't look like a Roblox username."), 400
    reason = " ".join(str(d.get("reason", "")).split())[:500]
    if not reason:
        return jsonify(error="Add a reason."), 400
    evidence = str(d.get("evidence", "")).strip()[:300]
    if evidence and not re.match(r"^https?://\S+$", evidence):
        return jsonify(error="Evidence must be a link starting with http:// or https://"), 400
    duration = " ".join(str(d.get("duration", "")).split())[:40] if t == "tempban" else ""
    if t == "tempban" and not duration:
        return jsonify(error="Add how long the temp ban lasts."), 400
    pm = bool(d.get("pm")) and t in ("warning", "kick")

    entry = {"id": new_case_id(), "type": t, "user": user, "reason": reason, "evidence": evidence, "duration": duration,
             "pm": pm, "mod": g.user["name"], "modAvatar": g.user.get("avatar", ""), "status": "Logged", "at": now_ms()}
    run("INSERT INTO moderations (id,type,user,reason,evidence,duration,pm,mod_id,mod_name,mod_avatar,status,at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        (entry["id"], t, user, reason, evidence, duration, int(pm), g.user["id"], entry["mod"], entry["modAvatar"], "Logged", entry["at"]))

    erlc = {"sent": False, "ok": True, "error": ""}
    cmd = None
    if AUTO_ERLC_ACTIONS:
        if t == "kick":
            cmd = f":kick {user} {reason[:200]}" if pm else f":kick {user}"
        elif t == "ban":
            cmd = f":ban {user}"
        elif t == "warning" and pm:
            cmd = f":pm {user} Warning: {reason[:200]}"
    if cmd:
        ok, err = send_erlc_command(cmd, g.user["name"])
        erlc = {"sent": True, "ok": ok, "error": err}
        forget("server")
        forget("bans")
    post_mod_log_to_discord(entry, g.user["id"])
    return jsonify(entry=entry, erlc=erlc)


# ------------------------------------------------------------------------------ players, bans, logs
@app.get("/api/players")
@auth("players.view")
def api_players():
    d, err = erlc_snapshot()
    if err:
        return jsonify(error=err), 502
    return jsonify(Players=d.get("Players") or [])


@app.get("/api/roblox/avatar/<int:uid>")
@auth()
def roblox_avatar(uid):
    """Redirects to the player's Roblox avatar image (the browser can't call Roblox's API itself).
    ?headshot=1 gives a small head-and-shoulders picture for list rows instead of the full body."""
    head = request.args.get("headshot") == "1"

    def fetch():
        try:
            r = requests.get("https://thumbnails.roblox.com/v1/users/" + ("avatar-headshot" if head else "avatar"), timeout=10, params={
                "userIds": uid, "size": "150x150" if head else "352x352", "format": "Png", "isCircular": "false"})
            d = (r.json().get("data") or [{}])[0]
        except (requests.RequestException, ValueError, AttributeError):
            return None
        url = d.get("imageUrl") or ""
        return url if d.get("state") == "Completed" and url.startswith("https://tr.rbxcdn.com/") else None
    url = cached(f"avatar:{uid}:{int(head)}", 600, fetch)
    return redirect(url) if url else ("", 404)


@app.get("/api/roblox/name/<name>/avatar")
@auth()
def roblox_avatar_by_name(name):
    """Same as above for a username (moderation logs only store the name). Keeps ?headshot=1."""
    if not USERNAME_RE.match(name):
        return "", 404

    def fetch():
        try:
            r = requests.post("https://users.roblox.com/v1/usernames/users", timeout=10,
                              json={"usernames": [name], "excludeBannedUsers": False})
            uid = ((r.json().get("data") or [{}])[0]).get("id")
        except (requests.RequestException, ValueError, AttributeError):
            return None
        return uid if isinstance(uid, int) else None
    uid = cached(f"robloxid:{name.lower()}", 86400, fetch)
    if not uid:
        forget(f"robloxid:{name.lower()}")   # don't remember a failed lookup for a whole day
    return redirect(f"/api/roblox/avatar/{uid}" + ("?headshot=1" if request.args.get("headshot") == "1" else "")) if uid else ("", 404)


@app.get("/api/bans")
@auth("bans.view")
def api_bans():
    d, err = cached("bans", ERLC_CACHE_SECONDS, lambda: erlc_get("/server/bans", base=ERLC_V1))
    if err:
        return jsonify(error=err), 502
    return jsonify(d)


@app.post("/api/bans/<int:uid>/unban")
@auth("bans.remove")
def api_unban(uid):
    ok, err = send_erlc_command(f":unban {uid}", g.user["name"])
    if ok:
        forget("bans")
    return jsonify(ok=ok, error=err), 200 if ok else 502


@app.get("/api/logs")
@auth("logs.view")
def api_logs():
    try:
        limit = max(1, min(1000, int(request.args.get("limit", 500))))
    except ValueError:
        limit = 500
    now = now_ms()
    out = rows("""SELECT type, user, cmd, target, text, at FROM logs
                  WHERE (type='command' AND at >= ?) OR (type!='command' AND at >= ?)
                  ORDER BY at DESC, id DESC LIMIT ?""",
               (now - COMMAND_RETENTION_DAYS * 86400000, now - LOG_RETENTION_DAYS * 86400000, limit))
    return jsonify(out)


@app.post("/api/logs/clear")
@auth("logs.clear")
def api_logs_clear():
    cutoff = now_ms()
    run("DELETE FROM logs WHERE at <= ?", (cutoff,))
    run("INSERT INTO settings (key, value) VALUES ('logs_cleared', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(cutoff),))
    return jsonify(ok=True)


# ------------------------------------------------------------------------------ commands
def command_history():
    return [{"command": r["command"], "ok": bool(r["ok"]), "error": r["error"] or "", "user": r["user_name"], "at": r["at"]}
            for r in rows("SELECT * FROM commands ORDER BY at DESC, id DESC LIMIT 50")]


@app.get("/api/commands")
@auth("commands.run")
def commands_list():
    return jsonify(command_history())


@app.post("/api/commands")
@auth("commands.run")
def commands_run():
    cmd = " ".join(str((request.get_json(silent=True) or {}).get("command", "")).split())
    if not cmd:
        return jsonify(ok=False, error="Type a command first."), 400
    if not cmd.startswith(":"):
        cmd = ":" + cmd
    if len(cmd) > 400:
        return jsonify(ok=False, error="That command is too long."), 400
    if cmd.split(" ")[0].lower() in BLOCKED_COMMANDS:
        return jsonify(ok=False, error="That command can only be run in game."), 403
    ok, err = send_erlc_command(cmd, g.user["name"])
    return jsonify(ok=ok, error=err)


# ------------------------------------------------------------------------------ automated messages
def automated_list():
    return [{"id": r["id"], "name": r["name"], "interval": r["interval_min"], "message": r["message"],
             "erlc": bool(r["erlc"]), "type": r["type"], "minPlayers": r["min_players"] or 0}
            for r in rows("SELECT * FROM automated_messages ORDER BY id")]


def read_automated(d):
    """(fields, None) or (None, error). The message is kept on one line, since ER:LC commands are one line."""
    name = " ".join(str(d.get("name", "")).split())[:40]
    message = " ".join(str(d.get("message", "")).split())[:300]
    try:
        interval = int(d.get("interval"))
    except (TypeError, ValueError):
        interval = 0
    try:
        min_players = int(d.get("minPlayers") or 0)
    except (TypeError, ValueError):
        min_players = -1
    if not name:
        return None, "Give it a name."
    if interval < AUTOMATED_MIN_MINUTES or interval > 10080:
        return None, f"The interval must be from {AUTOMATED_MIN_MINUTES} minutes to 10080 (one week)."
    if not message:
        return None, "Write the message to send."
    if d.get("type") not in AUTOMATED_TYPES:
        return None, "Pick an ER:LC type."
    if not 0 <= min_players <= 100:
        return None, "Minimum players must be from 0 to 100."
    return {"name": name, "interval": interval, "message": message, "erlc": int(bool(d.get("erlc"))),
            "type": d["type"], "min_players": min_players}, None


@app.get("/api/automated")
@auth("automated.manage")
def automated_get():
    return jsonify(automated_list())


@app.post("/api/automated")
@auth("automated.manage")
def automated_create():
    f, err = read_automated(request.get_json(silent=True) or {})
    if err:
        return jsonify(error=err), 400
    now = now_ms()   # last_sent starts now, so the first message goes out one interval from now
    run("INSERT INTO automated_messages (name, interval_min, message, erlc, type, min_players, last_sent, created_at) VALUES (?,?,?,?,?,?,?,?)",
        (f["name"], f["interval"], f["message"], f["erlc"], f["type"], f["min_players"], now, now))
    return jsonify(automated_list())


@app.post("/api/automated/<int:aid>")
@auth("automated.manage")
def automated_update(aid):
    if not rows("SELECT id FROM automated_messages WHERE id=?", (aid,)):
        return jsonify(error="That message doesn't exist any more."), 404
    f, err = read_automated(request.get_json(silent=True) or {})
    if err:
        return jsonify(error=err), 400
    run("UPDATE automated_messages SET name=?, interval_min=?, message=?, erlc=?, type=?, min_players=? WHERE id=?",
        (f["name"], f["interval"], f["message"], f["erlc"], f["type"], f["min_players"], aid))
    return jsonify(automated_list())


@app.post("/api/automated/<int:aid>/delete")
@auth("automated.manage")
def automated_delete(aid):
    run("DELETE FROM automated_messages WHERE id=?", (aid,))
    return jsonify(automated_list())


# ------------------------------------------------------------------------------ Discord integration
def dcfg():
    """Saved Discord integration settings (nickname prefixes, log channels, roles). Anything not set is blank."""
    def load():
        saved = rows("SELECT value FROM settings WHERE key='discord'")
        try:
            s = json.loads(saved[0]["value"]) if saved else {}
        except ValueError:
            s = {}
        s = s if isinstance(s, dict) else {}
        out = {"nick": dict.fromkeys(("shift", "loa"), ""), "channels": dict.fromkeys(DISCORD_CHANNEL_KEYS, ""),
               "roles": dict.fromkeys(DISCORD_ROLE_KEYS, ""), "overrides": {}}
        for sec in ("nick", "channels", "roles"):
            got = s.get(sec) if isinstance(s.get(sec), dict) else {}
            for k in out[sec]:
                if isinstance(got.get(k), str):
                    out[sec][k] = got[k]
        ov = s.get("overrides")
        if isinstance(ov, dict):
            out["overrides"] = {k: v for k, v in ov.items() if k in OVERRIDE_KEYS and isinstance(v, str) and v}
        return out
    return copy.deepcopy(cached("dcfg", 5, load))


def strip_prefixes(name):
    """Removes the on-shift / on-LOA prefix from a nickname."""
    c = dcfg()["nick"]
    for p in (c["shift"], c["loa"]):
        if p and name.startswith(p + " "):
            return name[len(p) + 1:]
    return name


def log_channel(group, key=None):
    """Channel id a log goes to: the type's own channel if one is set, otherwise the group's channel, otherwise ''."""
    c = dcfg()
    return (key and c["overrides"].get(f"{group}.{key}")) or c["channels"].get(group) or ""


def discord_post(channel_id, payload):
    """Posts a message to a Discord channel in the background. A Discord failure never breaks the panel."""
    if not channel_id:
        return

    def work():
        try:
            r = requests.post(f"{DISCORD_API}/channels/{channel_id}/messages", headers=bot_headers(), json=payload, timeout=10)
            if r.status_code not in (200, 201):
                print("Discord post failed:", r.status_code, r.text[:200])
        except Exception as e:
            print("Discord post error:", repr(e)[:200])
    threading.Thread(target=work, daemon=True).start()


def loa_active():
    r = rows("SELECT value FROM settings WHERE key='loa_active'")
    try:
        return set(json.loads(r[0]["value"])) if r else set()
    except ValueError:
        return set()


def sync_member(uid):
    """Makes someone's Discord roles and nickname match their state: on shift, on break, or on leave."""
    try:
        c = dcfg()
        if not (c["nick"]["shift"] or c["nick"]["loa"] or any(c["roles"].values())):
            return
        shift = rows("SELECT on_break FROM shifts WHERE user_id=? AND ended IS NULL", (uid,))
        on_break = bool(shift and shift[0]["on_break"])
        on_loa = uid in loa_active()
        roles = c["roles"]
        want = {"shift": bool(shift) and not (on_break and roles["break"]), "break": bool(shift) and on_break, "loa": on_loa}
        base = f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/members/{uid}"
        hdr = bot_headers("Panel shift status")
        for key in ("shift", "break", "loa"):
            if roles[key]:
                r = (requests.put if want[key] else requests.delete)(f"{base}/roles/{roles[key]}", headers=hdr, timeout=10)
                if r.status_code not in (200, 204):
                    print("Discord role update failed:", r.status_code, r.text[:200])
        prefix = c["nick"]["shift"] if shift else c["nick"]["loa"] if on_loa else ""
        if c["nick"]["shift"] or c["nick"]["loa"]:
            status, m = discord_member(uid)
            if status == 200:
                u = m.get("user", {})
                default = u.get("global_name") or u.get("username") or ""
                cur = m.get("nick") or ""
                name = strip_prefixes(cur) or default
                new = (prefix + " " + name)[:32] if prefix else name
                new = None if new == default else new   # null puts back their normal Discord name
                if (new or "") != cur:
                    r = requests.patch(base, headers=dict(hdr, **{"Content-Type": "application/json"}), json={"nick": new}, timeout=10)
                    if r.status_code not in (200, 204):
                        print("Discord nickname update failed:", r.status_code, r.text[:200])
    except Exception as e:
        print("Discord sync error:", repr(e)[:200])


def shift_changed(uid, ev):
    """Tells Discord about a shift change: a message in the shift log channel, then roles and nickname.
    ev is one of start, break, break_end, end, auto_end."""
    titles = {"start": "Shift Started", "break": "Shift Break Started", "break_end": "Shift Break Ended",
              "end": "Shift Ended", "auto_end": "Shift Ended (left the game)"}
    key = {"break_end": "break", "auto_end": "end"}.get(ev, ev)
    discord_post(log_channel("shift", key), {"embeds": [{"author": {"name": titles[ev]}, "description": f"<@{uid}>",
                                                          "color": 16777215, "timestamp": datetime.now(timezone.utc).isoformat()}]})
    threading.Thread(target=sync_member, args=(uid,), daemon=True).start()


def sync_loa():
    """Once a minute-ish: people whose approved leave has started get the LOA role and nickname; when it ends they lose them."""
    today = datetime.now(timezone.utc).date().isoformat()
    now_on = {r["user_id"] for r in rows("SELECT DISTINCT user_id FROM leave WHERE status='approved' AND start <= ? AND end >= ?", (today, today))}
    prev = loa_active()
    if now_on == prev:
        return
    run("INSERT INTO settings (key, value) VALUES ('loa_active', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        (json.dumps(sorted(now_on)),))
    for uid in now_on ^ prev:
        sync_member(uid)
    for uid in prev - now_on:
        discord_post(log_channel("loa", "ended"), {"embeds": [{"author": {"name": "Leave of Absence Ended"},
                                                                "description": f"<@{uid}>", "color": 16777215}]})


def discord_payload():
    return {"config": dcfg(),
            "overrideKeys": {g: [{"key": f"{g}.{k}", "label": label} for k, label in items] for g, items in DISCORD_OVERRIDES.items()}}


@app.get("/api/discord")
@auth("discord.manage")
def discord_get():
    return jsonify(discord_payload())


@app.post("/api/discord")
@auth("discord.manage")
def discord_save():
    d = request.get_json(silent=True) or {}
    c = dcfg()

    def sect(name):
        return d[name] if isinstance(d.get(name), dict) else {}
    for k, v in sect("nick").items():
        if k in c["nick"]:
            v = " ".join(str(v).split())
            if len(v) > 16:
                return jsonify(error="Prefixes can be at most 16 characters."), 400
            c["nick"][k] = v
    for sec, label in (("channels", "channel"), ("roles", "role")):
        for k, v in sect(sec).items():
            if k in c[sec]:
                v = str(v).strip()
                if v and not SNOWFLAKE_RE.match(v):
                    return jsonify(error=f"That {label} isn't valid."), 400
                c[sec][k] = v
    for k, v in sect("overrides").items():
        if k in OVERRIDE_KEYS:
            v = str(v).strip()
            if v and not SNOWFLAKE_RE.match(v):
                return jsonify(error="That channel isn't valid."), 400
            if v:
                c["overrides"][k] = v
            else:
                c["overrides"].pop(k, None)
    run("INSERT INTO settings (key, value) VALUES ('discord', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (json.dumps(c),))
    forget("dcfg")
    return jsonify(discord_payload())


@app.get("/api/discord/options")
@auth("discord.manage")
def discord_options():
    """Channels and roles in the Discord server, for the dropdowns. ?refresh=1 skips the short cache."""
    if request.args.get("refresh") == "1":
        forget("dopts")

    def fetch():
        out = {"channels": [], "roles": [], "error": ""}
        try:
            r = requests.get(f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/channels", headers=bot_headers(), timeout=10)
            if r.status_code == 200:
                out["channels"] = [{"id": c["id"], "name": c["name"]} for c in sorted(r.json(), key=lambda c: c.get("position", 0))
                                   if c.get("type") in (0, 5)]   # text and announcement channels
            else:
                out["error"] = f"Couldn't load channels from Discord ({r.status_code})."
            r = requests.get(f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/roles", headers=bot_headers(), timeout=10)
            if r.status_code == 200:
                out["roles"] = [{"id": x["id"], "name": x["name"]} for x in sorted(r.json(), key=lambda x: -x.get("position", 0))
                                if x["id"] != DISCORD_GUILD_ID and not x.get("managed")]
            else:
                out["error"] = out["error"] or f"Couldn't load roles from Discord ({r.status_code})."
        except requests.RequestException:
            out["error"] = "Couldn't reach Discord."
        return out
    out = cached("dopts", 30, fetch)
    if out["error"]:
        forget("dopts")   # don't remember a failure
    return jsonify(out)


# ------------------------------------------------------------------------------ shifts
def in_game(nick, players):
    """True if an in-game player's Roblox username appears as a whole word in this Discord nickname."""
    names = [split_player(p.get("Player"))[0] for p in players if isinstance(p, dict)]
    return any(re.search(rf"(?<![A-Za-z0-9_]){re.escape(n)}(?![A-Za-z0-9_])", nick or "", re.I)
               for n in names if n != "Unknown")


def end_shift(cur, at):
    """Ends a running shift at time `at` (ms), counting any open break up to then."""
    at = max(at, cur["started"])
    brk = (cur["break_ms"] or 0) + (max(0, at - cur["break_started"]) if cur["on_break"] else 0)
    n = rows("SELECT COUNT(*) AS n FROM moderations WHERE mod_id=? AND at BETWEEN ? AND ?", (cur["user_id"], cur["started"], at))[0]["n"]
    run("UPDATE shifts SET ended=?, break_ms=?, on_break=0, break_started=0, logs=? WHERE id=?", (at, brk, n, cur["id"]))


_last_seen = {}   # shift id -> ms the person was last seen in game (or on break)


def check_shifts_in_game():
    """Ends shifts of people who left the game. Does nothing while ER:LC can't be reached."""
    active = rows("SELECT * FROM shifts WHERE ended IS NULL")
    if not active:
        _last_seen.clear()
        return
    d, err = erlc_snapshot()
    if err or not isinstance(d, dict):
        return
    now, players = now_ms(), d.get("Players") or []
    for cur in active:
        # time on break doesn't count anyway, so being out of game on break is fine
        if cur["on_break"] or in_game(cur["user_name"], players):
            _last_seen[cur["id"]] = now
        elif now - _last_seen.setdefault(cur["id"], now) > SHIFT_GRACE_SECONDS * 1000:
            end_shift(cur, _last_seen.pop(cur["id"]))
            run("INSERT INTO staff_events (user_id, text, by_name, at) VALUES (?,?,?,?)",
                (cur["user_id"], "Shift ended automatically (left the game)", "Panel", now))
            shift_changed(cur["user_id"], "auto_end")
    for sid in set(_last_seen) - {r["id"] for r in active}:
        _last_seen.pop(sid, None)


def shifts_state():
    now = now_ms()
    active = [{"name": r["user_name"], "avatar": r["avatar"] or "", "started": r["started"], "onBreak": bool(r["on_break"]),
               "breakStartedAt": r["break_started"] or 0, "breakMs": r["break_ms"] or 0}
              for r in rows("SELECT * FROM shifts WHERE ended IS NULL ORDER BY started")]
    finished = [{"id": r["id"], "user": r["user_name"], "avatar": r["avatar"] or "", "started": r["started"], "ended": r["ended"],
                 "breakMs": r["break_ms"] or 0, "adjustMs": r["adjust_ms"] or 0, "manual": bool(r["manual"]),
                 "revoked": bool(r["revoked"]), "logs": r["logs"] or 0}
                for r in rows("SELECT * FROM shifts WHERE ended IS NOT NULL AND ended >= ? ORDER BY ended DESC LIMIT 500",
                              (now - 30 * 86400000,))]
    return {"active": active, "finished": finished}


@app.post("/api/shifts/<action>")
@auth("shifts.use")
def shifts_action(action):
    u, now = g.user, now_ms()
    cur = rows("SELECT * FROM shifts WHERE user_id=? AND ended IS NULL", (u["id"],))
    cur = cur[0] if cur else None
    if action == "start":
        if not cur:
            # shortcut: count-then-insert isn't atomic, two clicks at the same instant could pass the limit by one
            if MAX_ON_SHIFT and rows("SELECT COUNT(*) AS n FROM shifts WHERE ended IS NULL")[0]["n"] >= MAX_ON_SHIFT:
                return jsonify(error=f"The shift limit is full ({MAX_ON_SHIFT} on shift). Try again when someone ends theirs."), 409
            d, err = erlc_snapshot()
            if err:
                return jsonify(error=f"Couldn't check the ER:LC server: {err}"), 502
            if not in_game(u["name"], (d or {}).get("Players") or []):
                return jsonify(error="Join the ER:LC server first. Your Discord nickname must include your Roblox username."), 403
            run("INSERT INTO shifts (user_id, user_name, avatar, started) VALUES (?,?,?,?)",
                (u["id"], u["name"], u.get("avatar", ""), now))
    elif action == "break" and cur:
        if cur["on_break"]:
            run("UPDATE shifts SET break_ms = break_ms + ?, on_break = 0, break_started = 0 WHERE id=?",
                (now - cur["break_started"], cur["id"]))
        else:
            run("UPDATE shifts SET on_break = 1, break_started = ? WHERE id=?", (now, cur["id"]))
    elif action == "end" and cur:
        end_shift(cur, now)
    elif action not in ("start", "break", "end"):
        return jsonify(error="Unknown action."), 400
    ev = None
    if action == "start" and not cur:
        ev = "start"
    elif action == "break" and cur:
        ev = "break_end" if cur["on_break"] else "break"
    elif action == "end" and cur:
        ev = "end"
    if ev:
        shift_changed(u["id"], ev)
    return jsonify(shifts_state())


# ------------------------------------------------------------------------------ staff
def fetch_staff_from_discord():
    members, after = [], "0"
    while True:
        try:
            r = requests.get(f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/members", params={"limit": 1000, "after": after},
                             headers=bot_headers(), timeout=15)
        except requests.RequestException:
            return None
        if r.status_code != 200:
            return None
        batch = r.json()
        members += batch
        if len(batch) < 1000:
            break
        after = batch[-1]["user"]["id"]
    out = []
    for m in members:
        u = m["user"]
        if has_access(u["id"], m):
            out.append({"id": u["id"], "name": display_name(m), "handle": u.get("username", ""), "avatar": avatar_url(u)})
    return out


def staff_members():
    """Staff straight from Discord (cached), saved so the list still shows if Discord is briefly unreachable."""
    got = cached("staff", STAFF_CACHE_SECONDS, fetch_staff_from_discord)
    now = now_ms()
    if got is not None:
        with closing(db()) as c:
            for s in got:
                c.execute("""INSERT INTO staff (user_id,name,handle,avatar,first_seen) VALUES (?,?,?,?,?)
                             ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, handle=excluded.handle,
                             avatar=excluded.avatar""",
                          (s["id"], s["name"], s["handle"], s["avatar"], now))
            ids = [s["id"] for s in got]
            if ids:
                c.execute(f"DELETE FROM staff WHERE user_id NOT IN ({','.join('?' * len(ids))})", ids)
            c.commit()
        return with_roles(got)
    return with_roles([{"id": r["user_id"], "name": r["name"], "handle": r["handle"], "avatar": r["avatar"]}
                       for r in rows("SELECT * FROM staff")])


def public_roles():
    return [{"id": r["id"], "name": r["name"], "color": r["color"]} for r in role_rows()]


def top_role(m, roles_by_id):
    """(name, color) of the person's highest role."""
    if m["roleIds"]:
        r = roles_by_id[m["roleIds"][0]]
        return r["name"], r["color"]
    return ("Owner", "#f5a623") if m["id"] in OWNER_IDS else ("No role", "#6b6e75")


def outranks(viewer, m):
    return viewer["id"] in OWNER_IDS or (m["id"] != viewer["id"] and m["power"] < viewer["power"])


def staff_list(viewer):
    members = staff_members()
    strikes = {r["user_id"]: r["count"] for r in rows("SELECT * FROM strikes")}
    seen = {r["user_id"]: r["first_seen"] for r in rows("SELECT user_id, first_seen FROM staff")}
    roles = {r["id"]: r for r in role_rows()}
    can_assign = allowed(viewer, "roles.assign")
    out = []
    for m in sorted(members, key=lambda x: (-x["power"], x["name"].lower())):
        rank, color = top_role(m, roles)
        assign = can_assign and outranks(viewer, m)
        out.append({"id": m["id"], "name": m["name"], "handle": m["handle"], "avatar": m["avatar"],
                    "rank": rank, "rankColor": color, "roles": m["roleIds"], "strikes": strikes.get(m["id"], 0),
                    "since": seen.get(m["id"], now_ms()),
                    "canManage": allowed(viewer, "staff.manage") and m["id"] != viewer["id"] and m["power"] < viewer["power"],
                    "assignable": [i for i, r in roles.items() if viewer["id"] in OWNER_IDS or r["position"] < viewer["power"]] if assign else []})
    return out


def target_member(uid, viewer):
    """The staff member the viewer is allowed to manage, or an error response."""
    m = next((x for x in staff_members() if x["id"] == uid), None)
    if not m:
        return None, (jsonify(error="That person isn't on the staff team."), 404)
    if uid == g.user["id"] or m["power"] >= viewer["power"]:
        return None, (jsonify(error="You can't manage someone at or above your own role."), 403)
    return m, None


@app.post("/api/staff/<uid>/strike")
@auth("staff.manage")
def staff_strike(uid):
    m, bad = target_member(uid, g.user)
    if bad:
        return bad
    delta = 1 if (request.get_json(silent=True) or {}).get("delta") == 1 else -1
    cur = (rows("SELECT count FROM strikes WHERE user_id=?", (uid,)) or [{"count": 0}])[0]["count"]
    new = max(0, min(MAX_STRIKES, cur + delta))
    run("INSERT INTO strikes (user_id, count) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET count=excluded.count", (uid, new))
    if new != cur:
        staff_event(uid, f"{'Strike added' if delta > 0 else 'Strike removed'} ({new}/{MAX_STRIKES})")
    return jsonify(staff_list(g.user))


@app.post("/api/staff/<uid>/roles")
@auth("roles.assign")
def staff_roles(uid):
    viewer = g.user
    m = next((x for x in staff_members() if x["id"] == uid), None)
    if not m:
        return jsonify(error="That person isn't on the staff team."), 404
    if not outranks(viewer, m):
        return jsonify(error="You can only change roles for people below you."), 403
    roles = {r["id"]: r for r in role_rows()}
    try:
        want = {int(x) for x in (request.get_json(silent=True) or {}).get("roles") or []}
    except (TypeError, ValueError):
        return jsonify(error="Bad role list."), 400
    if want - set(roles):
        return jsonify(error="One of those roles doesn't exist any more. Reload and try again."), 400
    changed = want ^ set(m["roleIds"])
    if viewer["id"] not in OWNER_IDS and any(roles[i]["position"] >= viewer["power"] for i in changed):
        return jsonify(error="You can only give or take roles below your own."), 403
    if changed:
        with closing(db()) as c:
            c.execute("DELETE FROM user_roles WHERE user_id=?", (uid,))
            c.executemany("INSERT INTO user_roles (user_id, role_id) VALUES (?,?)", [(uid, i) for i in want])
            c.commit()
        names = [roles[i]["name"] for i in sorted(want, key=lambda i: -roles[i]["position"])]
        staff_event(uid, "Roles set to " + ", ".join(names) if names else "All roles removed")
        new_power = max((roles[i]["position"] for i in want), default=0)
        if uid not in OWNER_IDS and new_power != m["power"]:   # their top role moved up or down
            up = new_power > m["power"]
            new_top = roles[max(want, key=lambda i: roles[i]["position"])]["name"] if want else "No role"
            discord_post(log_channel("promotion" if up else "demotion"), {"embeds": [{
                "author": {"name": "Staff Promotion" if up else "Staff Demotion"}, "color": 16777215,
                "description": f"<@{uid}> was {'promoted' if up else 'demoted'} from **{top_role(m, roles)[0]}** to **{new_top}** by <@{viewer['id']}>."}]})
    return jsonify(staff_list(viewer))


# ------------------------------------------------------------------------------ staff profile
def staff_event(uid, text):
    run("INSERT INTO staff_events (user_id, text, by_name, at) VALUES (?,?,?,?)", (uid, text, g.user["name"], now_ms()))


def can_edit_shifts(m, viewer):
    # owners may also fix their own shifts; everyone else only edits people below them
    return allowed(viewer, "staff.manage") and (m["power"] < viewer["power"] or viewer["id"] in OWNER_IDS)


def shift_target(uid):
    """(member, None) if the viewer may edit this person's shifts, else (None, error response)."""
    m = next((x for x in staff_members() if x["id"] == uid), None)
    if not m:
        return None, (jsonify(error="That person isn't on the staff team."), 404)
    if not can_edit_shifts(m, g.user):
        return None, (jsonify(error="You can't edit this person's shifts."), 403)
    return m, None


def read_minutes(lo, hi):
    try:
        n = int((request.get_json(silent=True) or {}).get("minutes"))
    except (TypeError, ValueError):
        return None
    return n if lo <= n <= hi else None


@app.get("/api/staff/<uid>")
@auth("staff.view")
def staff_profile(uid):
    m = next((x for x in staff_members() if x["id"] == uid), None)
    if not m:
        return jsonify(error="That person isn't on the staff team."), 404
    since = now_ms() - 7 * 86400000
    shifts = [{"id": r["id"], "started": r["started"], "ended": r["ended"], "breakMs": r["break_ms"] or 0,
               "onBreak": bool(r["on_break"]), "breakStartedAt": r["break_started"] or 0, "adjustMs": r["adjust_ms"] or 0,
               "manual": bool(r["manual"]), "revoked": bool(r["revoked"]), "revokedBy": r["revoked_by"] or ""}
              for r in rows("SELECT * FROM shifts WHERE user_id=? ORDER BY COALESCE(ended, 9e15) DESC, id DESC LIMIT 200", (uid,))]
    return jsonify(
        shifts=shifts,
        history=rows("SELECT text, by_name AS by, at FROM staff_events WHERE user_id=? ORDER BY at DESC, id DESC LIMIT 200", (uid,)),
        logs7d=rows("SELECT COUNT(*) AS n FROM moderations WHERE mod_id=? AND at >= ?", (uid, since))[0]["n"],
        canEdit=can_edit_shifts(m, g.user))


@app.post("/api/staff/<uid>/shifts/<int:sid>")
@auth("staff.manage")
def staff_shift_edit(uid, sid):
    _, bad = shift_target(uid)
    if bad:
        return bad
    sh = rows("SELECT * FROM shifts WHERE id=? AND user_id=? AND ended IS NOT NULL", (sid, uid))
    if not sh:
        return jsonify(error="That shift doesn't exist or is still running."), 404
    sh = sh[0]
    action = (request.get_json(silent=True) or {}).get("action")
    when = datetime.fromtimestamp(sh["started"] / 1000, timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    if action == "revoke":
        run("UPDATE shifts SET revoked=1, revoked_by=? WHERE id=?", (g.user["name"], sid))
        staff_event(uid, f"Shift from {when} revoked")
    elif action == "restore":
        run("UPDATE shifts SET revoked=0, revoked_by=NULL WHERE id=?", (sid,))
        staff_event(uid, f"Shift from {when} restored")
    elif action == "set":
        mins = read_minutes(0, 24 * 60)
        if mins is None:
            return jsonify(error="Enter a length between 0 and 1440 minutes."), 400
        natural = sh["ended"] - sh["started"] - (sh["break_ms"] or 0)
        run("UPDATE shifts SET adjust_ms=? WHERE id=?", (mins * 60000 - natural, sid))
        staff_event(uid, f"Shift from {when} set to {mins} min")
    else:
        return jsonify(error="Unknown action."), 400
    return jsonify(ok=True)


@app.post("/api/staff/<uid>/time")
@auth("staff.manage")
def staff_time(uid):
    m, bad = shift_target(uid)
    if bad:
        return bad
    mins = read_minutes(-24 * 60, 24 * 60)
    if not mins:
        return jsonify(error="Enter minutes between -1440 and 1440, not 0."), 400
    now = now_ms()
    run("INSERT INTO shifts (user_id, user_name, avatar, started, ended, adjust_ms, manual) VALUES (?,?,?,?,?,?,1)",
        (uid, m["name"], m["avatar"], now, now, mins * 60000))
    staff_event(uid, f"{'Added' if mins > 0 else 'Removed'} {abs(mins)} min of shift time")
    return jsonify(ok=True)


# ------------------------------------------------------------------------------ quotas + leave
WEEK_MS = 7 * 86400000


def week_start(ms):
    """Monday 00:00 UTC of the week holding ms."""
    d = datetime.fromtimestamp(ms / 1000, timezone.utc).date()
    d -= timedelta(days=d.weekday())
    return int(datetime(d.year, d.month, d.day, tzinfo=timezone.utc).timestamp() * 1000)


def shift_seconds(a, b):
    """{user_id: seconds on shift} for shifts that ended between a and b (ms). Running shifts count toward now."""
    out = {r["user_id"]: (r["ms"] or 0) / 1000 for r in rows(
        """SELECT user_id, SUM(CASE WHEN revoked THEN 0 WHEN manual THEN COALESCE(adjust_ms, 0)
           ELSE MAX(0, ended - started - COALESCE(break_ms, 0) + COALESCE(adjust_ms, 0)) END) AS ms
           FROM shifts WHERE ended >= ? AND ended < ? GROUP BY user_id""", (a, b))}
    now = now_ms()
    if a <= now < b:
        for r in rows("SELECT * FROM shifts WHERE ended IS NULL"):
            ms = now - r["started"] - (r["break_ms"] or 0) - (now - r["break_started"] if r["on_break"] else 0)
            out[r["user_id"]] = out.get(r["user_id"], 0) + max(0, ms) / 1000
    return {k: max(0, v) for k, v in out.items()}


def leave_days(a):
    """{user_id: days of approved leave} in the week starting at a (ms)."""
    d0 = datetime.fromtimestamp(a / 1000, timezone.utc).date()
    d6 = d0 + timedelta(days=6)
    days = {}
    for r in rows("SELECT user_id, start, end FROM leave WHERE status='approved' AND start <= ? AND end >= ?",
                  (d6.isoformat(), d0.isoformat())):
        lo, hi = max(d0, date.fromisoformat(r["start"])), min(d6, date.fromisoformat(r["end"]))
        days.setdefault(r["user_id"], set()).update(lo + timedelta(days=i) for i in range((hi - lo).days + 1))
    return {k: len(v) for k, v in days.items()}


def quota_rows(members, a):
    """Each staff member's time against their goal for the week starting at a.
    shortcut: past weeks use today's staff list and hours, store weekly results if goals change often."""
    secs, away = shift_seconds(a, a + WEEK_MS), leave_days(a)
    roles = {r["id"]: r for r in role_rows()}
    out = []
    for m in members:
        rank, color = top_role(m, roles)
        hours = max((QUOTAS["hours"].get(str(i), 0) for i in m["roleIds"]), default=0)   # biggest goal among their roles
        off = away.get(m["id"], 0)
        goal, s = hours * 3600 * (7 - off) / 7, secs.get(m["id"], 0)
        status = "none" if not hours else "leave" if off >= 7 else "met" if s >= goal else "behind"
        out.append({"id": m["id"], "name": m["name"], "avatar": m["avatar"], "rank": rank, "rankColor": color,
                    "secs": s, "goal": goal, "leaveDays": off, "status": status})
    return out


@app.get("/api/quotas")
@auth("shifts.use")
def quotas_get():
    u, now = g.user, now_ms()
    members = sorted(staff_members(), key=lambda x: (-x["power"], x["name"].lower()))
    by_id = {m["id"]: m for m in members}
    ws = week_start(now)
    past, w = [], ws - WEEK_MS
    while QUOTAS["enabled"] and w >= QUOTAS["since"] and len(past) < 8:
        rs = [r for r in quota_rows(members, w) if r["status"] in ("met", "behind")]
        past.append({"start": w, "met": sum(r["status"] == "met" for r in rs), "total": len(rs),
                     "missed": [r["name"] for r in rs if r["status"] == "behind"]})
        w -= WEEK_MS
    manager = allowed(u, "staff.manage")
    today = datetime.now(timezone.utc).date().isoformat()
    leave = [{"id": r["id"], "name": r["user_name"], "avatar": by_id.get(r["user_id"], {}).get("avatar", ""),
              "start": r["start"], "end": r["end"], "reason": r["reason"], "status": r["status"],
              "decidedBy": r["decided_by"] or "", "mine": r["user_id"] == u["id"],
              "canDecide": r["status"] == "pending" and r["user_id"] in by_id and can_edit_shifts(by_id[r["user_id"]], u)}
             for r in rows("SELECT * FROM leave WHERE end >= ? ORDER BY start, id", (today,))
             if r["user_id"] == u["id"] or (manager and r["status"] != "denied")]
    return jsonify(enabled=QUOTAS["enabled"], since=QUOTAS["since"], hours=QUOTAS["hours"], weekStart=ws,
                   week=quota_rows(members, ws), past=past, leave=leave, canSettings=allowed(u, "settings.manage"))


@app.post("/api/leave")
@auth("shifts.use")
def leave_request():
    d = request.get_json(silent=True) or {}
    try:
        start, end = date.fromisoformat(str(d.get("start"))), date.fromisoformat(str(d.get("end")))
    except ValueError:
        return jsonify(error="Pick a start and end date."), 400
    reason = str(d.get("reason") or "").strip()
    if start < datetime.now(timezone.utc).date():
        return jsonify(error="Leave can't start in the past."), 400
    if end < start:
        return jsonify(error="The end date is before the start date."), 400
    if (end - start).days + 1 > MAX_LEAVE_DAYS:
        return jsonify(error=f"Leave can be at most {MAX_LEAVE_DAYS} days."), 400
    if not reason or len(reason) > 300:
        return jsonify(error="Give a reason, up to 300 characters."), 400
    if rows("SELECT COUNT(*) AS n FROM leave WHERE user_id=? AND status='pending'", (g.user["id"],))[0]["n"] >= 3:
        return jsonify(error="You already have 3 requests waiting. Wait for a decision first."), 400
    run("INSERT INTO leave (user_id, user_name, start, end, reason, status, at) VALUES (?,?,?,?,?,'pending',?)",
        (g.user["id"], g.user["name"], start.isoformat(), end.isoformat(), reason, now_ms()))
    discord_post(log_channel("loa", "submitted"), {"embeds": [{
        "author": {"name": "Leave of Absence Submitted"}, "color": 16777215, "description": f"<@{g.user['id']}> requested leave.",
        "fields": [{"name": "Dates", "value": f"{start.isoformat()} to {end.isoformat()}"}, {"name": "Reason", "value": reason}]}]})
    return jsonify(ok=True)


@app.post("/api/leave/<int:lid>")
@auth("shifts.use")
def leave_action(lid):
    r = rows("SELECT * FROM leave WHERE id=?", (lid,))
    if not r:
        return jsonify(error="That leave request doesn't exist."), 404
    r, action = r[0], (request.get_json(silent=True) or {}).get("action")
    span = f"{r['start']} to {r['end']}"
    if action == "cancel":
        if r["user_id"] != g.user["id"]:
            return jsonify(error="You can only cancel your own leave."), 403
        run("DELETE FROM leave WHERE id=?", (lid,))
        if r["status"] == "approved":
            staff_event(r["user_id"], f"Cancelled leave {span}")
    elif action in ("approve", "deny"):
        m = next((x for x in staff_members() if x["id"] == r["user_id"]), None)
        if r["status"] != "pending":
            return jsonify(error="That request was already decided."), 400
        if not m or not can_edit_shifts(m, g.user):
            return jsonify(error="You can't decide this person's leave."), 403
        status = "approved" if action == "approve" else "denied"
        run("UPDATE leave SET status=?, decided_by=? WHERE id=?", (status, g.user["name"], lid))
        staff_event(r["user_id"], f"Leave {span} {status}")
        discord_post(log_channel("loa", "result"), {"embeds": [{
            "author": {"name": f"Leave of Absence {status.capitalize()}"}, "color": 16777215,
            "description": f"<@{r['user_id']}>'s leave ({span}) was {status} by <@{g.user['id']}>."}]})
    else:
        return jsonify(error="Unknown action."), 400
    return jsonify(ok=True)


# ------------------------------------------------------------------------------ settings
# The CONFIG values above are the defaults. Owners can change these from the Settings page;
# changes are saved in the database and override CONFIG.
def settings_now():
    return {"autoErlc": AUTO_ERLC_ACTIONS,
            "blockedCommands": list(BLOCKED_COMMANDS), "logRetentionDays": LOG_RETENTION_DAYS,
            "commandRetentionDays": COMMAND_RETENTION_DAYS, "maxStrikes": MAX_STRIKES, "maxOnShift": MAX_ON_SHIFT,
            "quotas": {"enabled": QUOTAS["enabled"], "since": QUOTAS["since"], "hours": dict(QUOTAS["hours"])}}


def clean_settings(d):
    """(settings, None) or (None, error). Missing keys keep their current value."""
    if not isinstance(d, dict):
        return None, "Bad settings."
    out = settings_now()
    if "autoErlc" in d:
        out["autoErlc"] = bool(d["autoErlc"])
    if "blockedCommands" in d:
        cmds = d["blockedCommands"]
        if not isinstance(cmds, list) or len(cmds) > 100:
            return None, "Blocked commands must be a list of up to 100 commands."
        cmds = [str(c).strip().lower() for c in cmds if str(c).strip()]
        cmds = [c if c.startswith(":") else ":" + c for c in cmds]
        if any(not re.match(r"^:[a-z0-9_]{1,30}$", c) for c in cmds):
            return None, "Blocked commands are single words like :admin, one per line."
        out["blockedCommands"] = sorted(set(cmds), key=cmds.index)
    for k, label, lo, hi in (("logRetentionDays", "Server log days", 1, 365), ("commandRetentionDays", "Command log days", 1, 365),
                             ("maxStrikes", "Max strikes", 1, 10), ("maxOnShift", "Shift limit", 0, 100)):
        if k in d:
            try:
                n = int(d[k])
            except (TypeError, ValueError):
                n = None
            if n is None or not lo <= n <= hi:
                return None, f"{label} must be a whole number from {lo} to {hi}."
            out[k] = n
    if "quotas" in d:
        q = d["quotas"] if isinstance(d["quotas"], dict) else {}
        role_ids = {str(r["id"]) for r in rows("SELECT id FROM roles")}
        hours = {k: v for k, v in out["quotas"]["hours"].items() if k in role_ids}
        for k, v in (q.get("hours") or {}).items():
            try:
                v = float(v)
            except (TypeError, ValueError):
                v = -1
            if not 0 <= v <= 168:
                return None, "Quota hours must be from 0 to 168."
            if k in role_ids:   # roles deleted since the page loaded are skipped
                hours[k] = round(v, 2)
        on = bool(q.get("enabled", out["quotas"]["enabled"]))
        since = q.get("since", out["quotas"]["since"])
        if on and not since:
            since = week_start(now_ms()) + 7 * 86400000   # first checked week is the next full one
        out["quotas"] = {"enabled": on, "since": int(since or 0) if on else 0, "hours": hours}
    return out, None


def apply_settings(s):
    global AUTO_ERLC_ACTIONS, LOG_RETENTION_DAYS, COMMAND_RETENTION_DAYS, MAX_STRIKES, MAX_ON_SHIFT
    BLOCKED_COMMANDS[:] = s["blockedCommands"]
    AUTO_ERLC_ACTIONS, MAX_STRIKES, MAX_ON_SHIFT = s["autoErlc"], s["maxStrikes"], s["maxOnShift"]
    LOG_RETENTION_DAYS, COMMAND_RETENTION_DAYS = s["logRetentionDays"], s["commandRetentionDays"]
    QUOTAS.update(s["quotas"])


def load_settings():
    saved = rows("SELECT value FROM settings WHERE key='panel'")
    if saved:
        try:
            s, err = clean_settings(json.loads(saved[0]["value"]))
        except ValueError:
            s, err = None, "unreadable"
        if s:
            apply_settings(s)
        else:
            print("WARNING: saved settings ignored:", err)


seed_roles()
load_settings()


@app.get("/api/settings")
@auth("settings.manage")
def settings_get():
    return jsonify({**settings_now(), "roles": role_rows(), "perms": ALL_PERMS})


@app.post("/api/settings")
@auth("settings.manage")
def settings_save():
    d = request.get_json(silent=True) or {}
    role_perms = d.pop("rolePerms", None) if isinstance(d, dict) else None
    s, err = clean_settings(d)
    if err:
        return jsonify(error=err), 400
    if role_perms is not None:
        known = {str(r["id"]) for r in rows("SELECT id FROM roles")}
        if not isinstance(role_perms, dict) or any(not isinstance(v, list) for v in role_perms.values()):
            return jsonify(error="Bad role permissions."), 400
        for rid, perms in role_perms.items():
            if rid in known:   # roles deleted since the page loaded are skipped
                run("UPDATE roles SET perms=? WHERE id=?", (json.dumps([p for p in ALL_PERMS if p in perms]), int(rid)))
    save_settings(s)
    return jsonify({**settings_now(), "roles": role_rows(), "perms": ALL_PERMS})


def save_settings(s):
    run("INSERT INTO settings (key, value) VALUES ('panel', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (json.dumps(s),))
    apply_settings(s)


# ------------------------------------------------------------------------------ roles
HEX_RE = re.compile(r"^#[0-9a-fA-F]{6}$")


def roles_payload():
    counts = {r["role_id"]: r["n"] for r in rows("SELECT role_id, COUNT(*) AS n FROM user_roles GROUP BY role_id")}
    return [dict(r, members=counts.get(r["id"], 0)) for r in role_rows()]


def read_role_fields(d, current=None):
    """(name, color, None) or (None, None, error)."""
    name = " ".join(str(d.get("name", current["name"] if current else "")).split())[:32]
    color = str(d.get("color", current["color"] if current else "#6b6e75"))
    if not name:
        return None, None, "Give the role a name."
    if not HEX_RE.match(color):
        return None, None, "Pick a color."
    if any(r["name"].lower() == name.lower() and (not current or r["id"] != current["id"]) for r in role_rows()):
        return None, None, "Another role already has that name."
    return name, color.lower(), None


@app.get("/api/roles")
@auth("settings.manage")
def roles_get():
    return jsonify(roles_payload())


@app.post("/api/roles")
@auth("settings.manage")
def roles_create():
    name, color, err = read_role_fields(request.get_json(silent=True) or {})
    if err:
        return jsonify(error=err), 400
    run("UPDATE roles SET position = position + 1")   # new roles start at the bottom
    run("INSERT INTO roles (name, color, position, perms) VALUES (?,?,1,'[]')", (name, color))
    return jsonify(roles_payload())


@app.post("/api/roles/<int:rid>")
@auth("settings.manage")
def roles_update(rid):
    cur = next((r for r in role_rows() if r["id"] == rid), None)
    if not cur:
        return jsonify(error="That role doesn't exist any more."), 404
    d = request.get_json(silent=True) or {}
    if d.get("action") == "delete":
        run("DELETE FROM user_roles WHERE role_id=?", (rid,))
        run("DELETE FROM roles WHERE id=?", (rid,))
        run("UPDATE roles SET position = position - 1 WHERE position > ?", (cur["position"],))
    elif d.get("action") in ("up", "down"):
        other = rows("SELECT id, position FROM roles WHERE position " + ("> ? ORDER BY position" if d["action"] == "up" else "< ? ORDER BY position DESC") + " LIMIT 1",
                     (cur["position"],))
        if other:
            run("UPDATE roles SET position=? WHERE id=?", (other[0]["position"], rid))
            run("UPDATE roles SET position=? WHERE id=?", (cur["position"], other[0]["id"]))
    else:
        name, color, err = read_role_fields(d, cur)
        if err:
            return jsonify(error=err), 400
        run("UPDATE roles SET name=?, color=? WHERE id=?", (name, color, rid))
    return jsonify(roles_payload())


# ------------------------------------------------------------------------------ state + public stats
@app.get("/api/state")
@auth()
def api_state():
    u = g.user
    out = {"now": now_ms(), "roles": public_roles()}
    if allowed(u, "overview.view"):
        out["overview"] = build_overview()
    if allowed(u, "moderations.view"):
        out["moderations"] = [mod_row(r) for r in rows("SELECT * FROM moderations ORDER BY at DESC LIMIT 500")]
    if allowed(u, "shifts.use"):
        out["shifts"] = shifts_state()
    if allowed(u, "staff.view"):
        out["staff"] = staff_list(u)
    if allowed(u, "commands.run"):
        out["commands"] = command_history()
    return jsonify(out)


@app.get("/api/public/stats")
def public_stats():
    d, err = erlc_snapshot()
    d = d if isinstance(d, dict) else {}
    now = datetime.now(timezone.utc)
    start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    trend = []
    for back in range(6, -1, -1):
        a = int((start_today - timedelta(days=back)).timestamp() * 1000)
        trend.append(rows("SELECT COUNT(DISTINCT user) AS n FROM logs WHERE type='join' AND at >= ? AND at < ?", (a, a + 86400000))[0]["n"])
    week = rows("SELECT COUNT(DISTINCT user) AS n FROM logs WHERE type='join' AND at >= ?",
                (int((start_today - timedelta(days=6)).timestamp() * 1000),))[0]["n"]
    return jsonify(players=None if err else d.get("CurrentPlayers", len(d.get("Players") or [])),
                   maxPlayers=d.get("MaxPlayers") or 0, name=d.get("Name") or "", uniqueThisWeek=week, trend=trend)


# ------------------------------------------------------------------------------ home page (public)
run("""CREATE TABLE IF NOT EXISTS reviews (user_id TEXT PRIMARY KEY, name TEXT, avatar TEXT,
       stars INTEGER, text TEXT, at INTEGER)""")
TEAM_IDS = ["1498514468252942436", "1536879503421345932"]   # Owner, Co-Owner shown on the home page


def discord_profile(uid):
    """The person's own Discord profile name (never their nickname in our server)."""
    def fetch():
        try:
            r = requests.get(f"{DISCORD_API}/users/{uid}", headers=bot_headers(), timeout=10)
            if r.status_code == 200:
                u = r.json()
                return {"username": u.get("global_name") or u.get("username") or "Player", "avatar": avatar_url(u)}
        except requests.RequestException:
            pass
        return None
    prof = cached(f"profile:{uid}", 600, fetch)
    if not prof:
        forget(f"profile:{uid}")
    return prof


def home_user():
    p = session.get("pub")
    if p:
        return p
    u = session.get("user")   # staff sign-in: look up their profile name instead of using the server nickname
    if not u:
        return None
    prof = discord_profile(u["id"]) or {}
    return {"id": u["id"], "username": prof.get("username", "Player"), "avatar": prof.get("avatar") or u.get("avatar", "")}


@app.get("/api/home/me")
def home_me():
    u = home_user()
    if not u:
        return "", 401
    run("UPDATE reviews SET name=? WHERE user_id=? AND name!=?", (u["username"], u["id"], u["username"]))   # fixes older reviews saved with a nickname
    return jsonify(u)


@app.get("/api/home/reviews")
def home_reviews():
    u = home_user()
    uid = u["id"] if u else None
    out = rows("SELECT user_id, name, stars, text FROM reviews ORDER BY at DESC LIMIT 50")
    mine = rows("SELECT user_id, name, stars, text FROM reviews WHERE user_id=?", (uid,)) if uid else []
    if mine and all(r["user_id"] != uid for r in out):
        out = mine + out    # their own review always comes back so they can edit it
    return jsonify([{"name": r["name"], "stars": r["stars"], "text": r["text"], "mine": r["user_id"] == uid} for r in out])


@app.post("/api/home/reviews")
def home_review_post():
    if request.headers.get("X-Requested-With") != "panel":
        return jsonify(error="Bad request."), 403
    u = home_user()
    if not u:
        return jsonify(error="Sign in required."), 401
    d = request.get_json(silent=True) or {}
    text = " ".join(str(d.get("text", "")).split())[:240]
    try:
        stars = min(5, max(1, int(d.get("stars", 5))))
    except (TypeError, ValueError):
        stars = 5
    if len(text) < 3:
        return jsonify(error="Write a bit more."), 400
    existed = rows("SELECT 1 FROM reviews WHERE user_id=?", (u["id"],))
    run("""INSERT INTO reviews (user_id, name, avatar, stars, text, at) VALUES (?,?,?,?,?,?)
           ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, avatar=excluded.avatar,
           stars=excluded.stars, text=excluded.text, at=excluded.at""",
        (u["id"], u["username"], u.get("avatar", ""), stars, text, now_ms()))
    if not existed:   # only new reviews are announced, not edits
        discord_post(log_channel("reviews"), {"embeds": [{
            "author": {"name": "New Review"}, "color": 16777215, "description": text,
            "fields": [{"name": "Rating", "value": "\u2605" * stars + "\u2606" * (5 - stars), "inline": True},
                       {"name": "From", "value": u["username"] or "Player", "inline": True}]}]})
    return jsonify(ok=True)


def fetch_team():
    out = {}
    for uid in TEAM_IDS:
        try:
            r = requests.get(f"{DISCORD_API}/users/{uid}", headers=bot_headers(), timeout=10)
            if r.status_code == 200:
                u = r.json()
                out[uid] = {"name": u.get("global_name") or u.get("username"), "avatar": avatar_url(u)}
        except requests.RequestException:
            pass
    return out


@app.get("/api/home/team")
def home_team():
    return jsonify(cached("home_team", 600, fetch_team))


# ------------------------------------------------------------------------------ Roblox verification
def sb(method, path, **kw):
    """Supabase REST call (the key stays on the server)."""
    headers = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
    if not SUPABASE_KEY.startswith("sb_"):   # old-style JWT keys also go in Authorization; new sb_secret_ keys use apikey only
        headers["Authorization"] = "Bearer " + SUPABASE_KEY
    headers.update(kw.pop("headers", {}))
    return requests.request(method, f"{SUPABASE_URL}/rest/v1/{path}", headers=headers, timeout=10, **kw)


def link_accounts(discord_id, roblox_id, roblox_name):
    """Saves the Discord <-> Roblox link. Returns None on success or an error code."""
    try:
        r = sb("GET", "verifications", params={"roblox_id": f"eq.{roblox_id}", "select": "discord_id"})
        if r.status_code != 200:
            print("Supabase lookup failed:", r.status_code, r.text[:300])   # shows in this window only
            return "db"
        if any(str(x["discord_id"]) != str(discord_id) for x in r.json()):
            return "taken"   # that Roblox account already belongs to another Discord account
        r = sb("POST", "verifications", params={"on_conflict": "discord_id"},
               headers={"Prefer": "resolution=merge-duplicates,return=minimal"},
               json={"discord_id": discord_id, "roblox_id": roblox_id, "roblox_name": roblox_name})   # verified_at is filled in by the table's default
        if r.status_code not in (200, 201, 204):
            print("Supabase save failed:", r.status_code, r.text[:300])   # shows in this window only
            return "db"
        return None
    except (requests.RequestException, ValueError, KeyError) as e:
        print("Supabase error:", repr(e)[:300])
        return "db"


def apply_verified_discord(discord_id, roblox_name):
    """Gives the Verified role, removes Unverified, sets the nickname. Failures are ignored (the link is already saved)."""
    base = f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/members/{discord_id}"
    hdr = bot_headers("Roblox verification")
    try:
        if VERIFIED_ROLE_ID:
            requests.put(f"{base}/roles/{VERIFIED_ROLE_ID}", headers=hdr, timeout=10)
        if UNVERIFIED_ROLE_ID:
            requests.delete(f"{base}/roles/{UNVERIFIED_ROLE_ID}", headers=hdr, timeout=10)
        if SET_NICKNAME_TO_ROBLOX:
            requests.patch(base, headers=dict(hdr, **{"Content-Type": "application/json"}), json={"nick": roblox_name}, timeout=10)
    except requests.RequestException:
        pass


@app.get("/verify/start")
def verify_start():
    missing = [n for n, v in (("ROBLOX_CLIENT_ID", ROBLOX_CLIENT_ID), ("ROBLOX_CLIENT_SECRET", ROBLOX_CLIENT_SECRET),
                              ("SUPABASE_URL", SUPABASE_URL), ("SUPABASE_SECRET_KEY", SUPABASE_KEY)) if not v]
    if missing:
        print("Verification isn't set up. Missing or empty:", ", ".join(missing))   # shows in this window, not on the site
        return redirect("/verify?error=setup")
    if not home_user():   # we need to know which Discord account is verifying
        return redirect("/auth/login?mode=public&next=start")
    verifier, state = secrets.token_urlsafe(64), secrets.token_urlsafe(24)
    session["rbx"] = {"state": state, "verifier": verifier}
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    return redirect("https://apis.roblox.com/oauth/v1/authorize?" + urlencode({
        "client_id": ROBLOX_CLIENT_ID, "redirect_uri": SITE_URL + "/verify/callback", "scope": "openid profile",
        "response_type": "code", "state": state, "code_challenge": challenge, "code_challenge_method": "S256"}))


@app.get("/verify/callback")
def verify_callback():
    rbx = session.pop("rbx", None)
    u = home_user()
    if not u:
        return redirect("/verify?error=signin")
    if request.args.get("error"):
        return redirect("/verify?error=denied")
    code = request.args.get("code")
    if not rbx or not code or request.args.get("state") != rbx["state"]:
        return redirect("/verify?error=failed")
    try:
        t = requests.post("https://apis.roblox.com/oauth/v1/token", data={
            "client_id": ROBLOX_CLIENT_ID, "client_secret": ROBLOX_CLIENT_SECRET, "grant_type": "authorization_code",
            "code": code, "redirect_uri": SITE_URL + "/verify/callback", "code_verifier": rbx["verifier"]}, timeout=10)
        if t.status_code != 200:
            return redirect("/verify?error=failed")
        me = requests.get("https://apis.roblox.com/oauth/v1/userinfo",
                          headers={"Authorization": "Bearer " + t.json()["access_token"]}, timeout=10)
        info = me.json() if me.status_code == 200 else {}
    except (requests.RequestException, KeyError, ValueError):
        return redirect("/verify?error=failed")
    rid, rname = str(info.get("sub", "")), str(info.get("preferred_username") or "")
    if not rid.isdigit() or not USERNAME_RE.match(rname):
        return redirect("/verify?error=failed")
    status, _member = discord_member(u["id"])
    if status == 404:
        return redirect("/verify?error=notinserver")
    if status != 200:
        return redirect("/verify?error=failed")
    err = link_accounts(u["id"], rid, rname)
    if err:
        return redirect("/verify?error=" + err)
    apply_verified_discord(u["id"], rname)
    session["verified"] = {"roblox_username": rname, "roblox_id": rid, "discord_id": u["id"]}
    return redirect("/verify/done")


@app.get("/verify/done")
def page_verified():
    v = session.get("verified")
    if not v:
        return redirect("/verify")
    from html import escape
    with open(os.path.join(STATIC_DIR, "verified.html"), encoding="utf-8") as f:
        page = f.read()
    for key, val in (("__RNAME__", v["roblox_username"]), ("__RID__", v["roblox_id"]), ("__DID__", v["discord_id"]),
                     ("__GUILD__", f"https://discord.com/channels/{DISCORD_GUILD_ID}")):
        page = page.replace(key, escape(str(val)))   # filled in here, so the page doesn't need any script
    return page


@app.get("/verified.js")
def page_verified_js():
    return send_from_directory(STATIC_DIR, "verified.js")


@app.get("/api/verify/me")
def verify_me():
    v = session.get("verified")
    if not v:
        return "", 401
    return jsonify(dict(v, guild_url=f"https://discord.com/channels/{DISCORD_GUILD_ID}"))


# ------------------------------------------------------------------------------ pages
@app.get("/")
def page_home():
    return send_from_directory(STATIC_DIR, "home.html")


@app.get("/panel")
def page_panel():
    if not current_user():
        return redirect("/login")
    return send_from_directory(STATIC_DIR, "index.html")


@app.get("/home.js")
def page_home_js():
    return send_from_directory(STATIC_DIR, "home.js")


@app.get("/verify")
def page_verify():
    return send_from_directory(STATIC_DIR, "verify.html")


@app.get("/verify.js")
def page_verify_js():
    return send_from_directory(STATIC_DIR, "verify.js")


LOGIN_ERRORS = {
    "login": "Discord sign-in didn't finish. Sign in again.",
    "noaccess": "This Discord account has no staff role in the server. Ask an admin for one, then sign in again.",
}


@app.get("/login")
def page_login():
    if current_user():
        return redirect("/panel")
    with open(os.path.join(STATIC_DIR, "login.html")) as f:
        page = f.read()
    msg = LOGIN_ERRORS.get(request.args.get("error"))
    if msg:
        page = page.replace("<!--error-->", f'<div class="error" role="alert">{msg}</div>')
    return page


@app.get("/panel.js")
def page_js():
    return send_from_directory(STATIC_DIR, "panel.js")


@app.get("/logo.webp")
def page_logo():
    return send_from_directory(STATIC_DIR, "logo.webp")


@app.get("/img/<path:name>")
def page_img(name):
    return send_from_directory(STATIC_DIR + "/img", name)


CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; img-src 'self' data: https://cdn.discordapp.com https://tr.rbxcdn.com https://api.erlc.gg "
       "https://api.policeroleplay.community; connect-src 'self'; object-src 'none'; base-uri 'none'; "
       "form-action 'self'; frame-ancestors 'none'")


@app.after_request
def headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "same-origin"
    resp.headers["Content-Security-Policy"] = CSP
    if SITE_URL.startswith("https://"):
        resp.headers["Strict-Transport-Security"] = "max-age=31536000"
    if request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-store"
    return resp


def check_config():
    if len(SECRET_KEY) < 32:
        print("WARNING: SECRET_KEY is short. Use: python -c \"import secrets; print(secrets.token_hex(32))\"")
    if DEV_BYPASS_USER:
        print("WARNING: DEV_BYPASS_USER is on. Anyone can use the panel. Turn it off before going live.")
    if DISCORD_CLIENT_ID == "0" or DISCORD_GUILD_ID == "0":
        print("NOTE: Discord isn't set up yet, so nobody can sign in.")
    if not ERLC_SERVER_KEY:
        print("NOTE: ERLC_SERVER_KEY is empty, so live server data and commands are off.")


if __name__ == "__main__":
    check_config()
    start_background()
    app.run(host="127.0.0.1", port=PORT, threaded=True)
