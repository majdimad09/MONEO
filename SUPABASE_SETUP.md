# Cashly — Supabase Setup

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your:
- **Project URL** (`https://<ref>.supabase.co`)
- **Anon/public key** (under Settings → API)

## 2. Add credentials to `.env`

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Never commit `.env` to git.** It is already in `.gitignore`.
> Never use the `service_role` key in frontend code.

## 3. Run SQL schema in Supabase SQL Editor

Copy and run the entire block below in **Project → SQL Editor**.

```sql
-- ── PROFILES ──────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  currency    text not null default 'USD',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── USER PREFERENCES ──────────────────────────────────────────────────────────
create table if not exists user_preferences (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  monthly_budget  numeric not null default 0,
  category_limits jsonb   not null default '[]'::jsonb,
  currency        text    not null default 'USD',
  updated_at      timestamptz not null default now()
);

alter table user_preferences enable row level security;

create policy "Users can view their own preferences"
  on user_preferences for select using (auth.uid() = user_id);

create policy "Users can upsert their own preferences"
  on user_preferences for insert with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_preferences for update using (auth.uid() = user_id);

-- ── TRANSACTIONS ──────────────────────────────────────────────────────────────
create table if not exists transactions (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('income', 'expense')),
  amount        numeric not null,
  description   text not null default '',
  category      text not null default '',
  date          text not null,
  note          text,
  created_at_ms bigint not null default extract(epoch from now()) * 1000
);

create index if not exists transactions_user_id_idx on transactions(user_id);
create index if not exists transactions_date_idx    on transactions(date);

alter table transactions enable row level security;

create policy "Users can view their own transactions"
  on transactions for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on transactions for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on transactions for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on transactions for delete using (auth.uid() = user_id);

-- ── SAVING GOALS ──────────────────────────────────────────────────────────────
create table if not exists saving_goals (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  target_amount  numeric not null,
  current_amount numeric not null default 0,
  target_date    text not null,
  created_at_ms  bigint not null default extract(epoch from now()) * 1000
);

create index if not exists saving_goals_user_id_idx on saving_goals(user_id);

alter table saving_goals enable row level security;

create policy "Users can view their own saving goals"
  on saving_goals for select using (auth.uid() = user_id);

create policy "Users can insert their own saving goals"
  on saving_goals for insert with check (auth.uid() = user_id);

create policy "Users can update their own saving goals"
  on saving_goals for update using (auth.uid() = user_id);

create policy "Users can delete their own saving goals"
  on saving_goals for delete using (auth.uid() = user_id);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id                text primary key,
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  amount            numeric not null,
  frequency         text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  next_payment_date text not null,
  category          text not null default '',
  is_active         boolean not null default true,
  created_at_ms     bigint not null default extract(epoch from now()) * 1000
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);

alter table subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on subscriptions for insert with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on subscriptions for update using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on subscriptions for delete using (auth.uid() = user_id);
```

## 4. Configure Auth settings (in Supabase Dashboard)

- **Authentication → Settings → Site URL**: set to your app URL (e.g. `http://localhost:3003` for local dev, or your deployed domain)
- **Authentication → Settings → Redirect URLs**: add your app URL
- Optionally enable email confirmation under **Auth → Settings → Email Auth**

## 5. Restart dev server

```bash
npm run dev
```

The app detects the configured credentials and shows the Auth screen on first load. Guests can bypass auth using "Continue as Guest."
