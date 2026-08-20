# AI Chat + WhatsApp – Setup Guide

## 1. WhatsApp Button

Edit the file:
`src/components/chat/WhatsAppButton.jsx`

Replace:
```js
const ADMIN_WHATSAPP_NUMBER = '237XXXXXXXXX'
```
with your real number in international format **without** the `+` sign.
Examples:
- Cameroon → `237612345678`
- France   → `33612345678`
- Canada   → `15141234567`

The button appears bottom-right (above the AI chat bubble).

---

## 2. AI Tutor Chat (Edge Function)

The frontend calls the Supabase Edge Function `ai-tutor-chat`.

It uses the **same secrets** already used by `evaluate-essay` and `evaluate-eo`:

| Secret            | Role                          |
|-------------------|-------------------------------|
| `GROQ_API_KEY`    | Primary (recommended)         |
| `GEMINI_API_KEY`  | Optional fallback             |

### Deploy the function

```bash
supabase functions deploy ai-tutor-chat
```

You do **not** need a new key if you already set `GROQ_API_KEY` (or `GEMINI_API_KEY`) for essay evaluation.

If you still need to set them:
```bash
supabase secrets set GROQ_API_KEY=gsk_your_key_here
# optional fallback
supabase secrets set GEMINI_API_KEY=AIza_your_key_here
```

### What the user sees
- Floating purple chat bubble (bottom-right) on every protected page
- Full page at `/ai-chat` (also in the sidebar under “Progression”)
- Conversation history is saved in localStorage

---

## Files added / modified

**New files**
- `src/components/chat/AiChatWidget.jsx`
- `src/components/chat/WhatsAppButton.jsx`
- `src/pages/AiChat.jsx`
- `src/services/aiChatService.js`
- `supabase/functions/ai-tutor-chat/index.ts`

**Modified**
- `src/App.jsx` (route + lazy import)
- `src/components/layout/Sidebar.jsx` (nav item)
- `src/components/layout/AppLayout.jsx` (widgets + title)
