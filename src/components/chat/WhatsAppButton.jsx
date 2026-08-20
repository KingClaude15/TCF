import { MessageCircle } from 'lucide-react'

/**
 * Floating WhatsApp button that opens a chat with the admin.
 * Change ADMIN_WHATSAPP_NUMBER below to your real number (international format, no + or spaces).
 * Example: 237612345678 for Cameroon, 33612345678 for France, etc.
 */
const ADMIN_WHATSAPP_NUMBER = '237XXXXXXXXX' // ← REPLACE WITH YOUR NUMBER
const PREFILL_MESSAGE = encodeURIComponent(
  'Bonjour ! Je suis un étudiant du TCF 41-Day Challenge et j’aimerais vous contacter.'
)

export default function WhatsAppButton() {
  const href = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${PREFILL_MESSAGE}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Contacter l’admin sur WhatsApp"
      title="Contacter l’admin sur WhatsApp"
    >
      {/* Official WhatsApp-style icon */}
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.139-1.633-.797-1.888-.888-.255-.091-.44-.136-.625.136-.184.272-.715.888-.877 1.07-.162.182-.324.205-.601.068-.297-.139-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.625-1.504-.855-2.062-.225-.54-.453-.468-.625-.476-.162-.008-.347-.01-.533-.01-.184 0-.48.068-.732.372-.252.303-.96.938-.96 2.29 0 1.352.984 2.66 1.121 2.845.137.184 1.938 2.96 4.695 4.149.656.284 1.168.454 1.567.581.658.21 1.257.18 1.73.109.528-.079 1.633-.667 1.864-1.312.232-.645.232-1.197.162-1.312-.07-.114-.255-.182-.552-.32z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.11 1.52 5.835L.057 23.943a.5.5 0 00.61.61l6.108-1.463A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.78 9.78 0 01-4.98-1.36l-.357-.213-3.724.892.894-3.64-.232-.373A9.78 9.78 0 012.182 12 9.82 9.82 0 0112 2.182 9.82 9.82 0 0121.818 12 9.82 9.82 0 0112 21.818z" />
      </svg>
    </a>
  )
}
