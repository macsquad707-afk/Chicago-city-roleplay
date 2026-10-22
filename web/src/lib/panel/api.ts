// All panel calls go through here. The X-Requested-With header is what backend.py checks on POSTs.
// No body: GET. With a body: POST it as JSON.
export async function api<T = any>(path: string, body?: unknown): Promise<T> {
	const r = await fetch(path, body === undefined ? { cache: 'no-store' } : {
		method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'panel' }, body: JSON.stringify(body) });
	if (r.status === 401) { location.href = '/login'; throw new Error('Sign in required.'); }
	const d = await r.json().catch(() => ({}));
	if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
	return d;
}
