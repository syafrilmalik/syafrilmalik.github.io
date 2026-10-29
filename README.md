# Web profil Syafril Malik (versi GitHub Pages)

Isi: `index.html`, `config.js`, `backend.js`, `foto.jpg`, `supabase-setup.sql`, `worker.js` (opsional, untuk asisten AI).

## 1. Supabase (login, data, unggah foto/video)
1. Buat proyek di supabase.com.
2. Authentication > Users: tambahkan akun Anda (email + kata sandi). Authentication > Sign In / Providers: matikan pendaftaran pengguna baru.
3. SQL Editor: tempel isi `supabase-setup.sql`, ganti `GANTI_EMAIL_ANDA` dengan email akun Anda, lalu Run.
4. Project Settings > API: salin Project URL dan anon public key ke `config.js`, isi juga `OWNER_EMAIL`.
Jangan pernah menaruh kunci `service_role` di repo.

## 2. Asisten AI (opsional)
1. Buat Worker di Cloudflare, tempel `worker.js`.
2. Settings > Variables: tambahkan secret `ANTHROPIC_API_KEY` dan variable `ALLOWED_ORIGIN` (contoh `https://usernameanda.github.io`).
3. Salin alamat Worker ke `AI_URL` di `config.js`. Atur batas pengeluaran di akun Anthropic dan aturan rate limit di Cloudflare agar tidak disalahgunakan.

## 3. GitHub Pages
Unggah semua file ke repositori, lalu Settings > Pages > deploy dari branch `main`.

## Cara pakai
Pengunjung (tamu) langsung melihat profil tanpa login. Anda menekan "Masuk" di pojok atas, lalu formulir tambah/ubah/hapus dan unggah media muncul. Hanya email pemilik yang diizinkan menulis oleh aturan database.
