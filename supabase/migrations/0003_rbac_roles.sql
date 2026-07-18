-- =========================================================
-- RBAC upgrade: student / moderator / admin / super_admin
-- + explicit pending / approved / suspended account status
-- Safe to run whether or not 0002 has already been applied.
-- =========================================================

-- ---------------------------------------------------------
-- Defensive: make sure role/email exist even if migration 0002
-- was never applied (e.g. this is the first migration you're running).
-- ---------------------------------------------------------
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email from auth.users u where p.id = u.id and p.email is null;

-- ---------------------------------------------------------
-- STATUS: replaces the old is_approved boolean with a
-- three-state lifecycle so "suspended" is representable too.
-- ---------------------------------------------------------
alter table public.profiles add column if not exists status text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_approved'
  ) then
    execute '
      update public.profiles
      set status = case when coalesce(is_approved, true) then ''approved'' else ''pending'' end
      where status is null
    ';
  else
    update public.profiles set status = 'approved' where status is null;
  end if;
end $$;

alter table public.profiles alter column status set default 'pending';
alter table public.profiles alter column status set not null;

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check
  check (status in ('pending', 'approved', 'suspended'));

alter table public.profiles drop column if exists is_approved;

-- ---------------------------------------------------------
-- ROLE: upgrade from ('user','admin') to the full 4-tier model.
-- ---------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles set role = 'student' where role = 'user' or role is null;

alter table public.profiles alter column role set default 'student';
alter table public.profiles add constraint profiles_role_check
  check (role in ('student', 'moderator', 'admin', 'super_admin'));

-- ---------------------------------------------------------
-- Role-check helper functions (security definer avoids RLS
-- recursion when a policy needs to check the caller's own role).
-- ---------------------------------------------------------
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$ language sql stable security definer;

create or replace function public.is_super_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'super_admin'
  );
$$ language sql stable security definer;

create or replace function public.is_moderator_or_above()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin', 'super_admin')
  );
$$ language sql stable security definer;

-- ---------------------------------------------------------
-- Bootstrap: the very first person to ever sign up becomes
-- super_admin and is auto-approved (otherwise nobody could ever
-- approve anybody). Everyone after that starts as a pending student.
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first boolean;
begin
  select not exists(select 1 from public.profiles) into is_first;

  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    case when is_first then 'super_admin' else 'student' end,
    case when is_first then 'approved' else 'pending' end
  );

  insert into public.daily_progress (user_id, day_number)
  select new.id, generate_series(1, 41);

  return new;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------
-- Make sure at least one existing account can manage the system:
-- if no super_admin exists yet (e.g. this migration runs on a
-- project that already had users before RBAC existed), promote
-- the earliest-created profile.
-- ---------------------------------------------------------
do $$
declare
  earliest_user_id uuid;
begin
  if not exists (select 1 from public.profiles where role = 'super_admin') then
    select id into earliest_user_id from public.profiles order by created_at asc limit 1;
    if earliest_user_id is not null then
      update public.profiles set role = 'super_admin', status = 'approved' where id = earliest_user_id;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------
-- RLS: re-affirm admin read/update access to all profiles
-- (uses the refreshed is_admin() definition above).
-- ---------------------------------------------------------
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles for select using (public.is_admin());

drop policy if exists "admins update all profiles" on public.profiles;
create policy "admins update all profiles" on public.profiles for update using (public.is_admin());
