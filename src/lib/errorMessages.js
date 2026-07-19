/**
 * errorMessages.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central mapper that translates raw Supabase / network errors into friendly
 * French messages that students can actually act on. Every `toast.error(err.message)`
 * call in the app should go through `getFriendlyError(err)` instead.
 *
 * Architecture
 * ─────────────
 *  1. Auth errors    — Supabase Auth v2 error codes / known English messages
 *  2. PostgREST errors — numeric codes returned by the Postgres REST layer
 *  3. Storage errors  — file upload / signed-URL failures
 *  4. Edge Function errors — evaluate-essay / evaluate-eo / admin-users
 *  5. Network / generic fallback
 *
 * Usage
 * ──────
 *  import { getFriendlyError } from '../lib/errorMessages'
 *  toast.error(getFriendlyError(err))
 */

// ─── 1. Auth error map ────────────────────────────────────────────────────────
// Keys are substrings matched against err.message (case-insensitive).
// Order matters — first match wins.
const AUTH_MESSAGE_MAP = [
  // Sign-in
  { match: 'invalid login credentials',      msg: 'Email ou mot de passe incorrect. Vérifiez vos identifiants.' },
  { match: 'email not confirmed',             msg: 'Votre email n\'est pas encore confirmé. Consultez votre boîte de réception.' },
  { match: 'user not found',                 msg: 'Aucun compte trouvé pour cet email. Créez un compte d\'abord.' },
  { match: 'too many requests',              msg: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.' },
  // Sign-up
  { match: 'user already registered',        msg: 'Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.' },
  { match: 'password should be at least',    msg: 'Le mot de passe doit contenir au moins 6 caractères.' },
  { match: 'signup is disabled',             msg: 'Les nouvelles inscriptions sont temporairement désactivées. Contactez l\'administrateur.' },
  // OAuth / Google
  { match: 'oauth',                          msg: 'La connexion via Google a échoué. Réessayez ou utilisez votre email.' },
  // Password reset
  { match: 'email rate limit exceeded',      msg: 'Trop d\'emails envoyés. Attendez quelques minutes avant de réessayer.' },
  // Token / session
  { match: 'token has expired',             msg: 'Votre session a expiré. Reconnectez-vous.' },
  { match: 'invalid refresh token',         msg: 'Session invalide. Veuillez vous reconnecter.' },
  { match: 'jwt expired',                   msg: 'Votre session a expiré. Reconnectez-vous.' },
  { match: 'not authenticated',             msg: 'Vous devez être connecté pour effectuer cette action.' },
  // Account status (custom from RLS / profile checks)
  { match: 'account is suspended',          msg: 'Votre compte est suspendu. Contactez l\'administrateur.' },
  { match: 'account pending',               msg: 'Votre compte est en attente d\'approbation par un administrateur.' },
]

// ─── 2. PostgREST / Postgres error codes ─────────────────────────────────────
// err.code from Supabase follows PostgreSQL SQLSTATE codes.
const POSTGREST_CODE_MAP = {
  // Constraint violations
  '23505': 'Cette entrée existe déjà (doublon détecté).',
  '23503': 'Opération impossible : une donnée liée est requise.',
  '23502': 'Un champ obligatoire est manquant.',
  '22P02': 'Format de données invalide.',
  // Auth / RLS
  'PGRST301': 'Accès refusé. Vous n\'avez pas les droits pour cette opération.',
  'PGRST116': 'Aucune donnée trouvée.',
  '42501':    'Permission insuffisante pour accéder à cette ressource.',
  // Connection
  '08001': 'Impossible de se connecter à la base de données. Vérifiez votre connexion.',
  '08006': 'La connexion à la base de données a été interrompue.',
}

// ─── 3. Storage error messages ─────────────────────────────────────────────────
const STORAGE_MESSAGE_MAP = [
  { match: 'payload too large',            msg: 'Fichier trop volumineux. La taille maximale est de 50 MB.' },
  { match: 'mime type',                    msg: 'Format de fichier non supporté.' },
  { match: 'bucket not found',             msg: 'Espace de stockage introuvable. Contactez l\'administrateur.' },
  { match: 'object not found',             msg: 'Fichier introuvable ou lien expiré.' },
  { match: 'signed url',                   msg: 'Le lien de téléchargement a expiré. Rafraîchissez la page.' },
]

// ─── 4. Edge Function error patterns ─────────────────────────────────────────
const EDGE_FN_MESSAGE_MAP = [
  { match: 'evaluate-essay',               msg: 'La correction IA n\'est pas disponible pour le moment. Réessayez dans quelques instants.' },
  { match: 'evaluate-eo',                  msg: 'L\'évaluation orale IA n\'est pas disponible. Réessayez dans quelques instants.' },
  { match: 'admin-users',                  msg: 'L\'opération d\'administration a échoué. Vérifiez vos permissions.' },
  { match: 'non-2xx status',               msg: 'Le serveur a retourné une erreur. Réessayez dans quelques instants.' },
  { match: 'function not found',           msg: 'Service temporairement indisponible. Contactez l\'administrateur.' },
  { match: 'timeout',                      msg: 'La requête a pris trop de temps. Vérifiez votre connexion et réessayez.' },
]

// ─── 5. Generic network / unknown ────────────────────────────────────────────
const NETWORK_PATTERNS = [
  { match: 'failed to fetch',              msg: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.' },
  { match: 'networkerror',                 msg: 'Erreur réseau. Vérifiez votre connexion internet.' },
  { match: 'network request failed',       msg: 'Erreur réseau. Vérifiez votre connexion internet.' },
  { match: 'load failed',                  msg: 'Chargement impossible. Vérifiez votre connexion internet.' },
]

// ─── Main resolver ────────────────────────────────────────────────────────────
/**
 * Resolves a raw error (from Supabase, fetch, or any JS throw) into a
 * user-friendly French string suitable for toast.error() or inline display.
 *
 * @param {unknown} err   - The caught error value
 * @param {string}  [fallback] - Optional context-specific fallback message
 * @returns {string}
 */
export function getFriendlyError(err, fallback) {
  if (!err) return fallback || 'Une erreur inattendue s\'est produite.'

  const message = (err?.message || String(err)).trim()
  const code    = err?.code || err?.status || ''
  const lower   = message.toLowerCase()

  // 1. PostgREST code match (fastest — exact key lookup)
  if (code && POSTGREST_CODE_MAP[String(code)]) {
    return POSTGREST_CODE_MAP[String(code)]
  }

  // 2. Auth message substring match
  for (const { match, msg } of AUTH_MESSAGE_MAP) {
    if (lower.includes(match)) return msg
  }

  // 3. Storage message match
  for (const { match, msg } of STORAGE_MESSAGE_MAP) {
    if (lower.includes(match)) return msg
  }

  // 4. Edge Function match
  for (const { match, msg } of EDGE_FN_MESSAGE_MAP) {
    if (lower.includes(match)) return msg
  }

  // 5. Network match
  for (const { match, msg } of NETWORK_PATTERNS) {
    if (lower.includes(match)) return msg
  }

  // 6. Context-specific fallback from call site
  if (fallback) return fallback

  // 7. Last resort: sanitize the raw message (drop technical PG boilerplate)
  if (message && !message.startsWith('{"') && message.length < 200) {
    return message
  }

  return 'Une erreur inattendue s\'est produite. Réessayez ou contactez le support.'
}

/**
 * Convenience wrapper — calls getFriendlyError and passes result to
 * toast.error. Import alongside getFriendlyError where needed.
 *
 * Usage:
 *   import { toastError } from '../lib/errorMessages'
 *   catch (err) { toastError(err, 'Impossible de sauvegarder') }
 */
import toast from 'react-hot-toast'
export function toastError(err, fallback) {
  toast.error(getFriendlyError(err, fallback))
}
