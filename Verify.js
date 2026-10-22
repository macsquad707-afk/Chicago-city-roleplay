/* ================= CONFIG: edit these ================= */
const SITE_NAME = "Chicago City Roleplay";
const DISCORD_INVITE = "https://discord.gg/yourinvite";
const ROBLOX_START_URL = "/verify/start";   // backend route that signs them in with Discord, then Roblox
const SITE_LOGO = "/logo.webp";
/* ====================================================== */

const $ = id => document.getElementById(id);
document.title = SITE_NAME + " | Verification";
$('logo').src = SITE_LOGO;
$('favicon').href = SITE_LOGO;
$('siteName').textContent = SITE_NAME;
$('newTo').textContent = "New to " + SITE_NAME + "?";
$('lead').textContent = "Roblox will ask to share your username and avatar with " + SITE_NAME + ". That's it. No password.";
$('go').href = ROBLOX_START_URL;
$('discord').href = DISCORD_INVITE;
if (DISCORD_INVITE.includes('yourinvite')) $('discord').classList.add('hidden');   // placeholder link

const ERRORS = {
  setup: "Verification isn't set up yet. Let an admin know.",
  signin: "Sign in with Discord first, then try again.",
  denied: "You cancelled the Roblox sign-in. Try again when you're ready.",
  notinserver: "Join our Discord server first, then come back and verify.",
  taken: "That Roblox account is already linked to a different Discord account. Ask staff for help.",
  db: "We couldn't save your verification. Try again in a minute.",
  failed: "Roblox sign-in didn't finish. Try again."
};
const err = new URLSearchParams(location.search).get('error');
if (err) { $('alert').textContent = ERRORS[err] || ERRORS.failed; $('alert').classList.remove('hidden'); }
