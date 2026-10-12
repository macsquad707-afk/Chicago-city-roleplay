fetch('/api/verify/me', {credentials: 'include'})
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(v => {
    document.getElementById('rname').textContent = v.roblox_username;
    document.getElementById('rid').textContent = v.roblox_id;
    document.getElementById('did').textContent = v.discord_id;
    document.getElementById('back').href = v.guild_url;
  })
  .catch(() => { location.href = '/verify'; });
