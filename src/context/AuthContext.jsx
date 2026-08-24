import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  // profileEverLoaded tracks whether we've successfully fetched a profile
  // at least once in this session. Used so loadProfile() never shows the
  // full-screen spinner again once data is available — subsequent calls
  // (from refreshProfile or onboarding completion) update silently.
  const profileEverLoaded = useRef(false)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      profileEverLoaded.current = false
      setProfileLoading(false)
      return
    }
    // Only show the spinner on the very first load (no data yet).
    // On any subsequent call — refreshProfile after an update, or a
    // redundant onAuthStateChange event — update silently in the background.
    // This prevents ProtectedRoute from replacing <Outlet> with a spinner
    // just because refreshProfile() was called after saving the profile.
    if (!profileEverLoaded.current) {
      setProfileLoading(true)
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, status, created_at, onboarding_completed, subscription_status, paid_until, payment_note')
      .eq('id', userId)
      .maybeSingle()
    if (!error && data) {
      setProfile(data)
      profileEverLoaded.current = true
    }
    setProfileLoading(false)
  }, [])

  // Tracks whose profile is currently loaded, so we can tell a *real*
  // identity change (sign in, sign out, switch account) apart from
  // Supabase silently re-emitting onAuthStateChange for the SAME user —
  // which it does routinely (e.g. a TOKEN_REFRESHED event whenever the
  // browser tab regains focus/visibility, even though nothing about the
  // session actually needs re-fetching).
  //
  // BUG THIS FIXES: previously, every single onAuthStateChange event —
  // including those harmless same-user refreshes — called loadProfile(),
  // which flips profileLoading to true and back. ProtectedRoute renders a
  // full-screen spinner IN PLACE OF <Outlet/> while profileLoading is
  // true, which unmounts whatever page the user is currently on. The
  // practical symptom: switch to another browser tab/app and back, and
  // the page you were on would appear to "auto-refresh" — any in-progress
  // state (a partially written EE draft, quiz answers, scroll position)
  // was silently lost, even though nothing about the user's session had
  // actually changed.
  const lastLoadedUserId = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      lastLoadedUserId.current = uid
      loadProfile(uid)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (uid !== lastLoadedUserId.current) {
        lastLoadedUserId.current = uid
        loadProfile(uid)
      }
      // else: same user as already loaded (routine token refresh, tab
      // refocus, etc.) — session/token state above is still kept fresh,
      // but we deliberately skip re-fetching the profile so the rest of
      // the app never sees a spurious profileLoading flicker.
    })

    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  const refreshProfile = useCallback(() => loadProfile(user?.id), [loadProfile, user?.id])

  const signUpWithEmail = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  const value = {
    user,
    session,
    loading,
    profile,
    profileLoading,
    refreshProfile,
    isAuthenticated: !!user,
    isApproved: profile?.status === 'approved',
    isPending: profile?.status === 'pending',
    isSuspended: profile?.status === 'suspended',
    isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin',
    isSuperAdmin: profile?.role === 'super_admin',
    isModerator: profile?.role === 'moderator',
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
