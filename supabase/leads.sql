-- Supabase → SQL Editor → New query → вставить этот файл → Run
-- Таблица доступна только серверу с секретным ключом Supabase.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id uuid not null unique,
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (char_length(phone) between 7 and 24),
  service text not null default '' check (char_length(service) <= 80),
  message text not null default '' check (char_length(message) <= 1000),
  page text not null default '' check (char_length(page) <= 2048),
  utm jsonb not null default '{}'::jsonb,
  consent boolean not null check (consent = true),
  consent_version text not null default '2026-10-20',
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  telegram_notified boolean not null default false
);

alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
grant select, insert, update on table public.leads to service_role;
-- Не добавляйте публичные политики для anon/authenticated.
