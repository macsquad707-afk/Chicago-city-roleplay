"""
Staff panel backend (Flask + SQLite)

What it does
  - Discord sign-in. After login it checks the person's roles in your server and gives them a level
    (helper / mod / admin / owner). Roles are re-checked every few minutes.
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
import json
import os
import math
import re
import secrets
import sqlite3
import threading
import time
from contextlib import closing
from datetime import datetime, timedelta, timezone
from functools import wraps
from urllib.parse import quote, urlencode

import requests
from flask import Flask, g, jsonify, redirect, request, send_from_directory, session

# Load KEY=value lines from .env next to this file. Real environment variables win.
_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(_env):
    with open(_env) as f:
        for line in f:
            k, sep, v = line.strip().partition("=")
            if sep and not k.startswith("#"):
                os.environ.setdefault(k.strip(), v.strip())

# =====================================================================================
# CONFIG
# =====================================================================================
PORT = 3000
SITE_URL = "https://consolidated-remedy-lamb-instant.trycloudflare.com"    # public address of the site, no trailing slash (use https:// when live)
SECRET_KEY = os.environ["SECRET_KEY"]   # signs login cookies; make it long and random
DB_PATH = "panel.db"
STATIC_DIR = "."                          # folder holding index.html and an optional img/ folder

# Discord application (discord.com/developers). Add SITE_URL + "/auth/callback" under OAuth2 > Redirects.
DISCORD_CLIENT_ID = "1513580238997815526"
DISCORD_CLIENT_SECRET = os.environ["DISCORD_CLIENT_SECRET"]
DISCORD_BOT_TOKEN = os.environ["DISCORD_BOT_TOKEN"]           # the bot must be in your server
DISCORD_GUILD_ID = "1534782642262769744"

# Discord role IDs for each level. A person gets the highest level they match. Leave a list empty to skip it.
# Listing staff needs the bot's "Server Members Intent" turned on. Promote/demote needs "Manage Roles"
# and the bot's role placed above the staff roles.
ROLE_IDS = {
    "owner":  ["1558701321706672128", "1558701206363439154", "1558701098880081980"],   # Director, Deputy Director, Assistant Director
    "admin":  ["1558697723522195506", "1558710800624128041", "1558700228662796408"],                          # Administrator
    "mod":    ["1558695587593977927"],                          # Moderator
    "helper": [],
}

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

# Lowest level needed for each action: helper < mod < admin < owner
PERMISSIONS = {
    "overview.view": "helper",
    "players.view": "helper",
    "livemap.view": "helper",
    "moderations.view": "helper",
    "bans.view": "mod",
    "logs.view": "helper",
    "commands.run": "mod",
    "staff.view": "helper",
    "staff.manage": "admin",
    "shifts.use": "helper",
}
PAGE_PERMS = {
    "overview": "overview.view", "players": "players.view", "livemap": "livemap.view",
    "moderations": "moderations.view", "bans": "bans.view", "serverlogs": "logs.view",
    "commands": "commands.run", "staff": "staff.view", "shifts": "shifts.use",
}
# Lowest level that may log each type of moderation
MOD_TYPE_MIN_LEVEL = {"warning": "helper", "note": "helper", "kick": "mod", "ban": "mod", "tempban": "mod", "bolo": "mod"}

LADDER = ["helper", "mod", "admin"]       # ranks the panel can promote/demote between
MAX_STRIKES = 3
RECHECK_SECONDS = 300                     # how often a signed-in person's Discord roles are checked again
STAFF_CACHE_SECONDS = 60

# For testing on your own computer only. Set to {"id": "1", "name": "you", "avatar": "", "level": "owner"}
# to skip Discord sign-in. MUST be None on the live site.
DEV_BYPASS_USER = None
# =====================================================================================

DISCORD_API = "https://discord.com/api/v10"
LEVELS = {"helper": 1, "mod": 2, "admin": 3, "owner": 4}
RANK_LABEL = {"helper": "Helper", "mod": "Mod", "admin": "Admin", "owner": "Owner"}
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,20}$")
MOD_TYPES = set(MOD_TYPE_MIN_LEVEL)

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
        """)
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


def level_from_roles(role_ids):
    best = 0
    for name, ids in ROLE_IDS.items():
        if name in LEVELS and any(str(r) in [str(i) for i in ids] for r in role_ids):
            best = max(best, LEVELS[name])
    return best


def level_name(n):
    return {v: k for k, v in LEVELS.items()}.get(n)


def display_name(member):
    u = member.get("user", {})
    return member.get("nick") or u.get("global_name") or u.get("username") or "Unknown"


def avatar_url(user):
    h = user.get("avatar")
    return f"https://cdn.discordapp.com/avatars/{user['id']}/{h}.png?size=64" if h else ""


def current_user():
    if DEV_BYPASS_USER:
        return dict(DEV_BYPASS_USER)
    u = session.get("user")
    if not u:
        return None
    if time.time() - u.get("checked", 0) > RECHECK_SECONDS:
        status, member = discord_member(u["id"])
        if status == 200:
            lv = level_from_roles(member.get("roles", []))
            if lv == 0:
                session.clear()
                return None
            u = dict(u, level=level_name(lv), name=display_name(member), checked=time.time())
            session["user"] = u
        elif status == 404:
            session.clear()
            return None
        # if Discord is unreachable, keep the existing session for now
    return u


def auth(perm=None):
    def deco(fn):
        @wraps(fn)
        def wrapper(*a, **k):
            if request.method not in ("GET", "HEAD") and request.headers.get("X-Requested-With") != "panel":
                return jsonify(error="Bad request."), 403
            u = current_user()
            if not u:
                return jsonify(error="Sign in required."), 401
            if perm and LEVELS[u["level"]] < LEVELS[PERMISSIONS[perm]]:
                return jsonify(error="You don't have permission to do that."), 403
            g.user = u
            return fn(*a, **k)
        return wrapper
    return deco


def allowed(u, perm):
    return LEVELS[u["level"]] >= LEVELS[PERMISSIONS[perm]]


@app.get("/auth/login")
def auth_login():
    state = secrets.token_urlsafe(24)
    session["oauth_state"] = state
    return redirect("https://discord.com/oauth2/authorize?" + urlencode({
        "client_id": DISCORD_CLIENT_ID, "redirect_uri": SITE_URL + "/auth/callback",
        "response_type": "code", "scope": "identify", "state": state, "prompt": "none"}))


@app.get("/auth/callback")
def auth_callback():
    code = request.args.get("code")
    if not code or not request.args.get("state") or request.args.get("state") != session.pop("oauth_state", None):
        return redirect("/?error=login")
    try:
        t = requests.post(f"{DISCORD_API}/oauth2/token", data={
            "client_id": DISCORD_CLIENT_ID, "client_secret": DISCORD_CLIENT_SECRET, "grant_type": "authorization_code",
            "code": code, "redirect_uri": SITE_URL + "/auth/callback"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
        if t.status_code != 200:
            return redirect("/?error=login")
        me = requests.get(f"{DISCORD_API}/users/@me", headers={"Authorization": "Bearer " + t.json()["access_token"]}, timeout=10)
        if me.status_code != 200:
            return redirect("/?error=login")
    except (requests.RequestException, KeyError, ValueError):
        return redirect("/?error=login")
    user = me.json()
    status, member = discord_member(user["id"])
    if status == 404:
        return redirect("/?error=noaccess")
    if status != 200:
        return redirect("/?error=login")
    lv = level_from_roles(member.get("roles", []))
    if lv == 0:
        return redirect("/?error=noaccess")
    session.clear()
    session.permanent = True
    session["user"] = {"id": user["id"], "name": display_name(member), "avatar": avatar_url(user),
                       "level": level_name(lv), "checked": time.time()}
    return redirect("/")


@app.post("/auth/logout")
def auth_logout():
    session.clear()
    return jsonify(ok=True)


@app.get("/api/me")
@auth()
def api_me():
    u = g.user
    perms = [p for p in PERMISSIONS if allowed(u, p)]
    return jsonify(id=u["id"], name=u["name"], avatar=u.get("avatar", ""), level=u["level"],
                   perms=perms, pages=[p for p, perm in PAGE_PERMS.items() if perm in perms])


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


def send_erlc_command(cmd, who):
    """(ok, error). Records the attempt in the history unless we're just waiting out the cooldown."""
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
    with closing(db()) as c:
        for typ, user, cmd, target, text, ts in items:
            if not isinstance(ts, (int, float)):
                continue
            at = int(ts * 1000)
            c.execute("INSERT OR IGNORE INTO logs (dedupe, type, user, cmd, target, text, at) VALUES (?,?,?,?,?,?,?)",
                      (f"{typ}|{at}|{user}|{cmd or target}", typ, user, cmd, target, text, at))
        c.commit()


def prune_logs():
    now = now_ms()
    run("DELETE FROM logs WHERE (type='command' AND at < ?) OR (type!='command' AND at < ?)",
        (now - COMMAND_RETENTION_DAYS * 86400000, now - LOG_RETENTION_DAYS * 86400000))


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
            out["modCalls"].append({"user": split_player(m.get("Caller"))[0], "at": int(m["Timestamp"] * 1000)})
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


@app.get("/api/moderations")
@auth("moderations.view")
def moderations_list():
    return jsonify([mod_row(r) for r in rows("SELECT * FROM moderations ORDER BY at DESC LIMIT 500")])


@app.post("/api/moderations")
@auth("moderations.view")
def moderations_create():
    d = request.get_json(silent=True) or {}
    t = d.get("type")
    if t not in MOD_TYPES:
        return jsonify(error="Pick a type of log."), 400
    if LEVELS[g.user["level"]] < LEVELS[MOD_TYPE_MIN_LEVEL[t]]:
        return jsonify(error=f"You need a higher rank to log a {t}."), 403
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
@auth("livemap.view")
def roblox_avatar(uid):
    """Redirects to the player's Roblox avatar image (the browser can't call Roblox's API itself)."""
    def fetch():
        try:
            r = requests.get("https://thumbnails.roblox.com/v1/users/avatar", timeout=10, params={
                "userIds": uid, "size": "352x352", "format": "Png", "isCircular": "false"})
            d = (r.json().get("data") or [{}])[0]
        except (requests.RequestException, ValueError, AttributeError):
            return None
        url = d.get("imageUrl") or ""
        return url if d.get("state") == "Completed" and url.startswith("https://tr.rbxcdn.com/") else None
    url = cached(f"avatar:{uid}", 600, fetch)
    return redirect(url) if url else ("", 404)


@app.get("/api/bans")
@auth("bans.view")
def api_bans():
    d, err = cached("bans", ERLC_CACHE_SECONDS, lambda: erlc_get("/server/bans", base=ERLC_V1))
    if err:
        return jsonify(error=err), 502
    return jsonify(d)


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


# ------------------------------------------------------------------------------ shifts
def shifts_state():
    now = now_ms()
    active = [{"name": r["user_name"], "avatar": r["avatar"] or "", "started": r["started"], "onBreak": bool(r["on_break"]),
               "breakStartedAt": r["break_started"] or 0, "breakMs": r["break_ms"] or 0}
              for r in rows("SELECT * FROM shifts WHERE ended IS NULL ORDER BY started")]
    finished = [{"id": r["id"], "user": r["user_name"], "avatar": r["avatar"] or "", "started": r["started"], "ended": r["ended"],
                 "breakMs": r["break_ms"] or 0, "revoked": bool(r["revoked"]), "logs": r["logs"] or 0}
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
            run("INSERT INTO shifts (user_id, user_name, avatar, started) VALUES (?,?,?,?)",
                (u["id"], u["name"], u.get("avatar", ""), now))
    elif action == "break" and cur:
        if cur["on_break"]:
            run("UPDATE shifts SET break_ms = break_ms + ?, on_break = 0, break_started = 0 WHERE id=?",
                (now - cur["break_started"], cur["id"]))
        else:
            run("UPDATE shifts SET on_break = 1, break_started = ? WHERE id=?", (now, cur["id"]))
    elif action == "end" and cur:
        brk = (cur["break_ms"] or 0) + (now - cur["break_started"] if cur["on_break"] else 0)
        n = rows("SELECT COUNT(*) AS n FROM moderations WHERE mod_id=? AND at BETWEEN ? AND ?", (u["id"], cur["started"], now))[0]["n"]
        run("UPDATE shifts SET ended=?, break_ms=?, on_break=0, break_started=0, logs=? WHERE id=?", (now, brk, n, cur["id"]))
    elif action not in ("start", "break", "end"):
        return jsonify(error="Unknown action."), 400
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
        lv = level_from_roles(m.get("roles", []))
        if lv:
            u = m["user"]
            out.append({"id": u["id"], "name": display_name(m), "handle": u.get("username", ""), "avatar": avatar_url(u),
                        "level": lv, "roles": [str(x) for x in m.get("roles", [])]})
    return out


def staff_members():
    """Staff straight from Discord (cached), saved so the list still shows if Discord is briefly unreachable."""
    got = cached("staff", STAFF_CACHE_SECONDS, fetch_staff_from_discord)
    now = now_ms()
    if got is not None:
        with closing(db()) as c:
            for s in got:
                c.execute("""INSERT INTO staff (user_id,name,handle,avatar,rank,first_seen) VALUES (?,?,?,?,?,?)
                             ON CONFLICT(user_id) DO UPDATE SET name=excluded.name, handle=excluded.handle,
                             avatar=excluded.avatar, rank=excluded.rank""",
                          (s["id"], s["name"], s["handle"], s["avatar"], level_name(s["level"]), now))
            ids = [s["id"] for s in got]
            if ids:
                c.execute(f"DELETE FROM staff WHERE user_id NOT IN ({','.join('?' * len(ids))})", ids)
            c.commit()
        return got
    return [{"id": r["user_id"], "name": r["name"], "handle": r["handle"], "avatar": r["avatar"],
             "level": LEVELS.get(r["rank"], 1), "roles": []} for r in rows("SELECT * FROM staff")]


def staff_list(viewer):
    members = staff_members()
    strikes = {r["user_id"]: r["count"] for r in rows("SELECT * FROM strikes")}
    seen = {r["user_id"]: r["first_seen"] for r in rows("SELECT user_id, first_seen FROM staff")}
    vl = LEVELS[viewer["level"]]
    out = []
    for m in sorted(members, key=lambda x: (-x["level"], x["name"].lower())):
        out.append({"id": m["id"], "name": m["name"], "handle": m["handle"], "avatar": m["avatar"],
                    "rank": RANK_LABEL[level_name(m["level"])], "strikes": strikes.get(m["id"], 0),
                    "since": seen.get(m["id"], now_ms()),
                    "canManage": allowed(viewer, "staff.manage") and m["id"] != viewer["id"] and m["level"] < vl})
    return out


def target_member(uid, viewer):
    """The staff member the viewer is allowed to manage, or an error response."""
    m = next((x for x in staff_members() if x["id"] == uid), None)
    if not m:
        return None, (jsonify(error="That person isn't on the staff team."), 404)
    if uid == g.user["id"] or m["level"] >= LEVELS[viewer["level"]]:
        return None, (jsonify(error="You can't manage someone at or above your own rank."), 403)
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
    return jsonify(staff_list(g.user))


@app.post("/api/staff/<uid>/rank")
@auth("staff.manage")
def staff_rank(uid):
    m, bad = target_member(uid, g.user)
    if bad:
        return bad
    direction = (request.get_json(silent=True) or {}).get("direction")
    cur = level_name(m["level"])
    if cur not in LADDER or direction not in ("up", "down"):
        return jsonify(error="That rank can't be changed here."), 400
    i = LADDER.index(cur) + (1 if direction == "up" else -1)
    if i < 0 or i >= len(LADDER):
        return jsonify(error="They're already at the end of the ladder."), 400
    new = LADDER[i]
    if LEVELS[new] >= LEVELS[g.user["level"]]:
        return jsonify(error="You can only promote people to a rank below your own."), 403
    if not ROLE_IDS.get(new):
        return jsonify(error=f"No Discord role is set up for {RANK_LABEL[new]}."), 400
    why = f"Staff panel: {g.user['name']} changed rank"
    try:
        r = requests.put(f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/members/{uid}/roles/{ROLE_IDS[new][0]}",
                         headers=bot_headers(why), timeout=10)
        if r.status_code not in (200, 204):
            return jsonify(error="Discord wouldn't add the role. Check the bot's Manage Roles permission and role order."), 502
        for rid in ROLE_IDS.get(cur, []):
            if str(rid) in m["roles"]:
                requests.delete(f"{DISCORD_API}/guilds/{DISCORD_GUILD_ID}/members/{uid}/roles/{rid}", headers=bot_headers(why), timeout=10)
    except requests.RequestException:
        return jsonify(error="Couldn't reach Discord."), 502
    forget("staff")
    return jsonify(staff_list(g.user))


# ------------------------------------------------------------------------------ state + public stats
@app.get("/api/state")
@auth()
def api_state():
    u = g.user
    out = {"now": now_ms()}
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


# ------------------------------------------------------------------------------ pages
@app.get("/")
def page_home():
    return send_from_directory(STATIC_DIR, "index.html")


@app.get("/img/<path:name>")
def page_img(name):
    return send_from_directory(STATIC_DIR + "/img", name)


# ponytail: inline <script> forces 'unsafe-inline'; move JS to a file to drop it.
CSP = ("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
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
    app.run(host="0.0.0.0", port=PORT, threaded=True)