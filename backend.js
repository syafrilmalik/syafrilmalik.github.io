// Menghubungkan index.html ke Supabase (login, data, unggah media) dan ke Worker AI.
(() => {
  const C = window.CFG || {};
  const $ = s => document.querySelector(s);
  if (!C.SUPABASE_URL || !C.SUPABASE_KEY || !window.supabase) { $('#lg').hidden = true; return; }
  const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const cache = {}, subs = {};
  let sess = null;
  const ready = sb.auth.getSession().then(r => { sess = r.data.session; });

  async function load(k) {
    const { data, error } = await sb.from('entries').select('id,data').eq('kind', k).order('created_at', { ascending: false });
    if (error) { subs[k] && subs[k].err && subs[k].err(error); return; }
    cache[k] = Object.fromEntries(data.map(r => [r.id, r.data]));
    subs[k] && subs[k].next({ docs: data.map(r => ({ id: r.id, data: () => r.data })) });
  }
  const must = async p => { const { data, error } = await p; if (error || !data || !data.length) throw error || new Error('ditolak'); };

  const db = { collection: k => ({
    onSnapshot(next, err) { subs[k] = { next, err }; load(k); return () => delete subs[k]; },
    async add(d) { await must(sb.from('entries').insert({ kind: k, data: d }).select('id')); await load(k); },
    doc: id => ({
      async update(d) { await must(sb.from('entries').update({ data: { ...((cache[k] || {})[id]), ...d } }).eq('id', id).select('id')); await load(k); },
      async delete() { await must(sb.from('entries').delete().eq('id', id).select('id')); await load(k); }
    })
  }) };

  const assets = { async upload(f) {
    const p = crypto.randomUUID() + '-' + f.name.replace(/[^\w.-]/g, '_');
    const { error } = await sb.storage.from('media').upload(p, f, { contentType: f.type });
    if (error) throw error;
    return { url: sb.storage.from('media').getPublicUrl(p).data.publicUrl };
  } };

  const sample = async (input, o) => {
    const r = await fetch(C.AI_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: input }) });
    if (r.status === 429) throw { code: 'rate_limited' };
    if (!r.ok) throw { code: 'error' };
    const j = await r.json();
    if (o && o.onText) o.onText({ text: j.text });
    return { text: j.text };
  };

  // Antarmuka yang dipakai index.html (sama seperti versi claude.ai)
  window.claude = { use: async n => {
    await ready;
    if (n === 'user') return { isOwner: () => !!sess && (!C.OWNER_EMAIL || sess.user.email === C.OWNER_EMAIL) };
    if (n === 'db') return db;
    if (n === 'assets') return sess ? assets : null;
    if (n === 'sample') return C.AI_URL ? sample : null;
    return null;
  } };

  // Login pemilik; tamu tidak perlu login
  ready.then(() => {
    const b = $('#lg');
    b.textContent = sess ? 'Keluar' : 'Masuk';
    b.onclick = async () => { if (sess) { await sb.auth.signOut(); location.reload(); } else $('#dl').showModal(); };
  });
  $('#lno').onclick = () => $('#dl').close();
  $('#lgo').onclick = async () => {
    const { error } = await sb.auth.signInWithPassword({ email: $('#le').value.trim(), password: $('#lp').value });
    if (error) { $('#lerr').textContent = 'Email atau kata sandi salah.'; return; }
    location.reload();
  };
})();
