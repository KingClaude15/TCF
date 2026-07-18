// Sends the admin an email whenever a new account is created, using
// FormSubmit (https://formsubmit.co) — a free service that emails whoever
// owns the target address when you POST to its endpoint. No backend or API
// key needed.
//
// IMPORTANT (one-time step): the first time an email is ever sent to
// ADMIN_NOTIFY_EMAIL this way, FormSubmit sends THAT address a confirmation
// email with an "Activate Form" link. Nothing will arrive for real signups
// until that link is clicked once.

const ADMIN_NOTIFY_EMAIL = 'fankyjoe216@gmail.com'

export async function notifyAdminNewSignup({ fullName, email }) {
  try {
    await fetch(`https://formsubmit.co/ajax/${ADMIN_NOTIFY_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: 'TCF 41-Day Challenge — nouvelle inscription à approuver',
        Nom: fullName || '—',
        Email: email,
        Message: `${fullName || 'Un nouvel utilisateur'} (${email}) vient de créer un compte et attend ton approbation dans le panneau admin.`,
      }),
    })
  } catch {
    // Best-effort notification — a failure here should never block signup.
  }
}
