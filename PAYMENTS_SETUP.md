# Paiements manuels MTN / Orange

## 1. SQL (Supabase → SQL Editor)

Exécute le fichier :
`supabase/migrations/0015_subscriptions.sql`

## 2. Numéros de paiement

Édite `src/services/subscriptionService.js` → objet `PAYMENT_INFO` :
- `mtn.number` / `orange.number` : tes vrais numéros
- `name` : nom affiché sur le transfert

## 3. Règles produit

- **Gratuit :** 5 corrections EE (soumissions avec IA)
- **Payant :** 2 500 FCFA pour 7 jours d’accès illimité EE
- L’étudiant déclare le paiement sur `/pricing`
- L’admin valide dans **Admin → Paiements**

## 4. Compte EE

Le quota compte les `ee_submissions` avec statut
`submitted` | `evaluating` | `evaluated` | `error`
(pas les simples brouillons).

Les admins ne sont pas limités.
