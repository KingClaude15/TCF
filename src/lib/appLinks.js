/**
 * Public resources and contact links (override via Vite env).
 */

/** PDF guide offered after EE writing */
export const EE_GUIDE_PDF_URL = '/resources/TCF-Expression-Ecrite-Pour-Anglophones.pdf'
export const EE_GUIDE_TITLE = 'TCF Expression Écrite pour Anglophones'
export const EE_GUIDE_FILENAME = 'TCF-Expression-Ecrite-Pour-Anglophones.pdf'

/**
 * Admin WhatsApp — digits only with country code, no + or spaces.
 * Example: 237670000000
 * Set VITE_ADMIN_WHATSAPP in .env
 */
export function getAdminWhatsAppUrl(message) {
  const raw = (import.meta.env.VITE_ADMIN_WHATSAPP || '').replace(/\D/g, '')
  if (!raw) return null
  const text = encodeURIComponent(
    message ||
      "Bonjour, mon compte TCF 41 Challenge est suspendu. Je souhaiterais de l'aide pour le réactiver."
  )
  return `https://wa.me/${raw}?text=${text}`
}

export function hasAdminWhatsApp() {
  return Boolean((import.meta.env.VITE_ADMIN_WHATSAPP || '').replace(/\D/g, ''))
}
