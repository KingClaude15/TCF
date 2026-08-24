-- Subscription / manual MoMo-Orange payments
-- Free tier: 5 EE evaluations. Paid: weekly access (e.g. 2500 FCFA / 7 days).

alter table public.profiles
  add column if not exists subscription_status text not null default 'free'
    check (subscription_status in ('free', 'pending', 'active', 'expired'));

alter table public.profiles
  add column if not exists paid_until timestamptz;

alter table public.profiles
  add column if not exists payment_note text;

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null default 2500,
  currency text not null default 'XAF',
  plan text not null default 'weekly',
  duration_days integer not null default 7,
  operator text check (operator in ('mtn', 'orange', 'other')),
  reference_code text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payment_requests_status_idx on public.payment_requests (status, created_at desc);
create index if not exists payment_requests_user_idx on public.payment_requests (user_id, created_at desc);

alter table public.payment_requests enable row level security;

-- Students: insert own pending request, read own requests
create policy "Users insert own payment requests"
  on public.payment_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users read own payment requests"
  on public.payment_requests for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- Admins update any payment request
create policy "Admins update payment requests"
  on public.payment_requests for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

-- Profiles: users can read own subscription fields (already covered by existing profile policies ideally)
-- Ensure paid_until / subscription_status readable by owner — typically profiles select own is already there.
