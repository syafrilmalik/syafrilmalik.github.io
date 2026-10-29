// Cloudflare Worker: perantara aman ke Claude API. Kunci API disimpan sebagai secret, tidak pernah ada di halaman.
export default {
  async fetch(req, env) {
    const o = req.headers.get('Origin') || '';
    const ok = o === env.ALLOWED_ORIGIN; // contoh: https://usernameanda.github.io
    const h = { 'Access-Control-Allow-Origin': ok ? o : 'null', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    if (req.method !== 'POST' || !ok) return new Response('Forbidden', { status: 403, headers: h });
    let b; try { b = await req.json(); } catch { return new Response('Bad request', { status: 400, headers: h }); }
    const m = (Array.isArray(b.messages) ? b.messages : []).slice(-8)
      .filter(x => (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string')
      .map(x => ({ role: x.role, content: x.content.slice(0, 6000) }));
    if (!m.length || m[0].role !== 'user') return new Response('Bad request', { status: 400, headers: h });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 800, messages: m })
    });
    if (!r.ok) return new Response('Upstream error', { status: r.status === 429 ? 429 : 502, headers: h });
    const j = await r.json();
    const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    return new Response(JSON.stringify({ text }), { headers: { ...h, 'content-type': 'application/json' } });
  }
};
