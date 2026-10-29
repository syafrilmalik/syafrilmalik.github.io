-- Jalankan di Supabase: SQL Editor. Ganti GANTI_EMAIL_ANDA (3 tempat di bawah, 4 dengan storage) dengan email pemilik.
create table entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('posts','projects','skills','experience','certs')),
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table entries enable row level security;
create policy "semua orang boleh membaca" on entries for select using (true);
create policy "hanya pemilik boleh menulis" on entries for all to authenticated
  using ((auth.jwt() ->> 'email') = 'GANTI_EMAIL_ANDA')
  with check ((auth.jwt() ->> 'email') = 'GANTI_EMAIL_ANDA');

insert into storage.buckets (id, name, public, file_size_limit) values ('media', 'media', true, 52428800) on conflict do nothing;
create policy "media boleh dilihat semua" on storage.objects for select using (bucket_id = 'media');
create policy "pemilik boleh unggah media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (auth.jwt() ->> 'email') = 'GANTI_EMAIL_ANDA');
create policy "pemilik boleh hapus media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (auth.jwt() ->> 'email') = 'GANTI_EMAIL_ANDA');

insert into entries (kind, data) values ('experience',
 '{"title":"IT & Monitoring","sub":"PT Bintang Jasa Artha Kelola","period":"Saat ini","desc":"Memantau sistem dan layanan IT, mendukung operasional, dan menyusun dokumentasi.","tags":[],"url":"","created":0}');
