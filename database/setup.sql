-- setup.sql
-- ============================================================
-- QADAM: вся база данных. Вставьте файл целиком в Supabase →
-- SQL Editor → New query → Run. Запускать можно повторно.
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- Таблицы ----------
create table if not exists categories (
  id   text primary key,
  name text not null
);
insert into categories values
  ('speech','Речь и коммуникация'),('neuro','Нейроразвитие'),('learn','Обучение'),
  ('sense','Слух и зрение'),('motor','Двигательное развитие'),('emo','Эмоциональная поддержка')
on conflict do nothing;

create table if not exists specialists (
  id             bigint generated always as identity primary key,
  name           text not null check (char_length(name) between 2 and 100),
  role           text not null check (char_length(role) between 2 and 80),
  category_id    text not null references categories(id),
  city           text not null check (city in ('Алматы','Астана','Шымкент','Другой город')),
  langs          text[] not null check (cardinality(langs) > 0 and langs <@ array['ru','kk']),
  age_min        int not null check (age_min >= 0),
  age_max        int not null check (age_max <= 17 and age_max >= age_min),
  format         text not null default 'Очный приём',
  price          int check (price is null or price >= 0),
  bio            text check (char_length(bio) <= 600),
  phone          text not null check (phone ~ '^\+?[0-9 ()-]{10,18}$'),
  email          text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  license_no     text,
  access_code    text not null unique default upper(encode(gen_random_bytes(6),'hex')),
  status         text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  reject_reason  text,
  verified_at    timestamptz,
  verified_until timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists idx_sp_public on specialists(status, category_id, city);

create table if not exists documents (
  id            bigint generated always as identity primary key,
  specialist_id bigint not null references specialists(id) on delete cascade,
  kind          text not null check (kind in ('id','diploma','license')),
  file_path     text not null,
  original_name text not null,
  created_at    timestamptz not null default now()
);

create table if not exists audit_log (
  id            bigint generated always as identity primary key,
  specialist_id bigint references specialists(id) on delete set null,
  action        text not null,
  note          text,
  admin_id      uuid default auth.uid(),
  created_at    timestamptz not null default now()
);

create table if not exists admins (user_id uuid primary key references auth.users(id) on delete cascade);

-- ---------- Права доступа к строкам (RLS) ----------
alter table categories enable row level security;
alter table specialists enable row level security;
alter table documents   enable row level security;
alter table audit_log   enable row level security;
alter table admins      enable row level security;   -- политик нет: читать и менять может только сервер

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

drop policy if exists cat_read   on categories;  create policy cat_read   on categories  for select using (true);
drop policy if exists sp_admin   on specialists; create policy sp_admin   on specialists for select using (is_admin());
drop policy if exists doc_admin  on documents;   create policy doc_admin  on documents   for select using (is_admin());
drop policy if exists audit_admin on audit_log;  create policy audit_admin on audit_log  for all using (is_admin()) with check (is_admin());
-- Гости и обычные пользователи напрямую таблицы specialists/documents не видят и не меняют.

-- ---------- Публичный список: только проверенные, без email и документов ----------
create or replace function public_specialists(
  p_category text default null, p_city text default null, p_lang text default null, p_age int default null)
returns table (id bigint, name text, role text, category text, city text, langs text[], age_min int, age_max int,
               format text, price int, bio text, phone text, verified_at timestamptz)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.role, s.category_id, s.city, s.langs, s.age_min, s.age_max, s.format, s.price, s.bio, s.phone, s.verified_at
  from specialists s
  where s.status = 'approved' and s.verified_until > now()
    and (p_category is null or s.category_id = p_category)
    and (p_city is null or s.city = p_city)
    and (p_lang is null or p_lang = any (s.langs))
    and (p_age is null or (s.age_min <= (array[2,5,11,17])[p_age + 1] and s.age_max >= (array[0,3,6,12])[p_age + 1]))
  order by s.verified_at desc limit 100
$$;

-- ---------- Подача заявки ----------
create or replace function submit_application(
  p_name text, p_role text, p_category text, p_city text, p_langs text[], p_age_min int, p_age_max int,
  p_format text, p_price int, p_bio text, p_phone text, p_email text, p_license_no text, p_consent boolean)
returns table (out_id bigint, out_code text)
language plpgsql security definer set search_path = public as $$
declare v specialists;
begin
  if not coalesce(p_consent, false) then raise exception 'Нужно согласие на обработку персональных данных'; end if;
  if exists (select 1 from specialists where email = lower(trim(p_email)) and status = 'pending') then
    raise exception 'Заявка с этим email уже на проверке'; end if;
  insert into specialists(name, role, category_id, city, langs, age_min, age_max, format, price, bio, phone, email, license_no)
  values (trim(p_name), trim(p_role), p_category, p_city, p_langs, p_age_min, p_age_max, left(coalesce(p_format,'Очный приём'),40),
          p_price, left(coalesce(p_bio,''),600), trim(p_phone), lower(trim(p_email)), left(coalesce(p_license_no,''),60))
  returning * into v;
  insert into audit_log(specialist_id, action) values (v.id, 'submitted');
  return query select v.id, v.access_code;
end $$;

create or replace function add_document(p_code text, p_kind text, p_path text, p_name text) returns void
language plpgsql security definer set search_path = public as $$
declare sid bigint;
begin
  select id into sid from specialists where access_code = upper(trim(p_code)) and status = 'pending';
  if sid is null then raise exception 'Заявка не найдена'; end if;
  if p_kind not in ('id','diploma','license') or split_part(p_path,'/',1) <> sid::text then raise exception 'Неверный документ'; end if;
  insert into documents(specialist_id, kind, file_path, original_name) values (sid, p_kind, p_path, left(p_name,120));
end $$;

create or replace function application_status(p_code text)
returns table (status text, reason text, until timestamptz)
language sql stable security definer set search_path = public as $$
  select status, reject_reason, verified_until from specialists where access_code = upper(trim(p_code))
$$;

-- ---------- Решение администратора ----------
create or replace function admin_decide(p_id bigint, p_decision text, p_note text default '',
                                        p_identity boolean default false, p_diploma boolean default false)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Нет доступа'; end if;
  if p_decision = 'approve' then
    if not (p_identity and p_diploma) then raise exception 'Подтвердите личность и диплом'; end if;
    if (select count(distinct kind) from documents where specialist_id = p_id and kind in ('id','diploma')) < 2 then
      raise exception 'Не хватает документов: нужны удостоверение и диплом'; end if;
    update specialists set status='approved', reject_reason=null, verified_at=now(), verified_until=now()+interval '12 months' where id = p_id;
  elsif p_decision in ('reject','suspend') then
    if char_length(trim(coalesce(p_note,''))) < 5 then raise exception 'Укажите причину'; end if;
    update specialists set status = case p_decision when 'reject' then 'rejected' else 'suspended' end, reject_reason = trim(p_note) where id = p_id;
  else raise exception 'Неизвестное решение'; end if;
  insert into audit_log(specialist_id, action, note) values (p_id, p_decision, nullif(trim(coalesce(p_note,'')),''));
end $$;

-- ---------- Закрытое хранилище документов ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents','documents', false, 5242880, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

-- загружать в папку заявки можно только в течение часа после её подачи
create or replace function can_upload(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from specialists s where s.id::text = split_part(p_name,'/',1)
                 and s.status = 'pending' and s.created_at > now() - interval '1 hour')
$$;
drop policy if exists "docs upload" on storage.objects;
create policy "docs upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'documents' and can_upload(name));
drop policy if exists "docs admin read" on storage.objects;
create policy "docs admin read" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and is_admin());

-- ============================================================
-- ПОСЛЕ запуска: создайте пользователя в Authentication → Users → Add user
-- (email и пароль администратора), затем выполните, подставив его email:
--
-- insert into admins(user_id) select id from auth.users where email = 'admin@example.com';
-- ============================================================