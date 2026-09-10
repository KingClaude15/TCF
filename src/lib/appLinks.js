/**
 * Public resources and contact links (override via Vite env).
 */

/** PDF guide offered after EE writing */
export const EE_GUIDE_PDF_URL = '/resources/TCF-Expression-Ecrite-Pour-Anglophones.pdf'
export const EE_GUIDE_TITLE = 'TCF Expression Écrite pour Anglophones'
export const EE_GUIDE_FILENAME = 'TCF-Expression-Ecrite-Pour-Anglophones.pdf'

/**
 * Default admin WhatsApp (Cameroon): 650795097 → 237650795097
 * Override anytime with VITE_ADMIN_WHATSAPP in `.env` (not .env.example).
 */
const DEFAULT_ADMIN_WHATSAPP = '237650795097'

/**
 * Normalize to international digits for wa.me
 * - strips non-digits
 * - if 9 digits starting with 6 (CM mobile), prefix 237
 * - if starts with 00, drop 00
 */
export function normalizeWhatsAppNumber(input) {
  let digits = String(input || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) digits = digits.slice(2)
  // Local Cameroon mobile: 6XXXXXXXX
  if (digits.length === 9 && digits.startsWith('6')) {
    digits = '237' + digits
  }
  // Already 237 + 9 digits
  return digits
}

function resolveAdminWhatsApp() {
  const fromEnv = normalizeWhatsAppNumber(import.meta.env.VITE_ADMIN_WHATSAPP)
  if (fromEnv) return fromEnv
  return normalizeWhatsAppNumber(DEFAULT_ADMIN_WHATSAPP)
}

/**
 * Build https://wa.me/<number>?text=...
 * Always returns a URL when a number is available (env or default).
 */
export function getAdminWhatsAppUrl(message) {
  const raw = resolveAdminWhatsApp()
  if (!raw) return null
  const text = encodeURIComponent(
    message ||
      "Bonjour, mon compte TCF 41 Challenge est suspendu. Je souhaiterais de l'aide pour le réactiver."
  )
  return `https://wa.me/${raw}?text=${text}`
}

export function hasAdminWhatsApp() {
  return Boolean(resolveAdminWhatsApp())
}

/** Digits-only number for display / debugging */
export function getAdminWhatsAppNumber() {
  return resolveAdminWhatsApp()
}
