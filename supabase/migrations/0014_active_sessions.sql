-- =========================================================
-- Active sessions / device management
--
-- Supabase's `auth.sessions` table is what actually tracks a user's
-- active sessions across devices, but the `auth` schema is intentionally
-- NOT exposed through the auto-generated REST API — Supabase's own docs
-- are explicit about this. There's also no built-in client method to list
-- a user's own sessions or revoke one specific session by id (the
-- official supabase.auth.signOut({ scope }) only supports 'local', all
-- 'others', or 'global' — not "this one specific device").
--
-- These two SECURITY DEFINER functions bridge that gap safely: they run
-- with elevated privileges (required, since the `authenticated` role has
-- no grants on the `auth` schema at all), but every query is filtered to
-- `auth.uid()` — the caller's own verified identity from their JWT — so a
-- user can only ever see or revoke their own sessions, never anyone
-- else's, regardless of the function's elevated privileges.
--
-- IMPORTANT CAVEAT: Supabase does not publish a stable, versioned schema
-- for auth.sessions (its exact columns can change between GoTrue/Auth
-- server versions without a major announcement). list_my_sessions()
-- deliberately uses `select to_jsonb(s)` — i.e. "give me whatever columns
-- actually exist" — rather than naming specific columns like `user_agent`
-- or `ip`, so this keeps working even if that internal schema changes.
-- The frontend reads whichever fields happen to be present and falls back
-- gracefully (see src/components/profile/ActiveSessions.jsx) rather than
-- assuming any particular field is guaranteed to exist.
--
-- Deleting a row from auth.sessions is the same mechanism Supabase Auth
-- itself uses internally when a session is terminated (confirmed in their
-- own docs: "When a user signs out, the sessions affected ... are removed
-- from the database entirely") — so this is not a workaround, it's using
-- the real mechanism directly, just exposed safely to the owning user.
-- =========================================================

create or replace function public.list_my_sessions()
returns setof jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  return query execute
    'select to_jsonb(s) from auth.sessions s where s.user_id = $1 order by s.created_at desc'
  using auth.uid();
end;
$$;

revoke all on function public.list_my_sessions() from public;
grant execute on function public.list_my_sessions() to authenticated;

create or replace function public.revoke_my_session(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- The "and user_id = auth.uid()" guard is what makes this safe despite
  -- running with elevated privileges: it's structurally impossible for a
  -- caller to pass someone else's session id and have it match.
  delete from auth.sessions
  where id = target_session_id
    and user_id = auth.uid();
end;
$$;

revoke all on function public.revoke_my_session(uuid) from public;
grant execute on function public.revoke_my_session(uuid) to authenticated;
