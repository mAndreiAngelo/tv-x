# TV X – magazin online de televizoare (proiect demo)

Magazin online demonstrativ, construit pentru curs și portofoliu. Produsele sunt fictive,
iar plățile rulează exclusiv în modul de test Stripe. Specificația completă: `TV - X.md`.

## Pornire rapidă

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run seed
npm run dev
```

Site-ul rulează pe http://localhost:3000.

> Proiect demonstrativ – nu se efectuează vânzări reale.

## Baza de date

SQLite prin Prisma 7. Comenzi utile:

```bash
npm run db:migrate   # aplică migrațiile (creează dev.db)
npm run seed         # resetează baza și o umple cu date de test (se poate rula oricând)
```

Seed-ul creează 40 de televizoare fictive (branduri inventate: Aurion, Kairo, Lumexa, Nordis, Voltra),
aproximativ 200 de recenzii și două conturi de test:

| Email | Parolă | Descriere |
| --- | --- | --- |
| client@tvx.test | Client123! | client cu istoric de comenzi, adrese și recenzii |
| nou@tvx.test | Client123! | client nou, fără comenzi |

## Plăți Stripe (doar mod test)

1. Copiază cheile de test din Stripe Dashboard (Developers → API keys, cu „Test mode” activ) în `.env`:
   `STRIPE_SECRET_KEY="sk_test_..."` și `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."`.
   Aplicația refuză cheile live (`sk_live_...`).
2. Instalează [Stripe CLI](https://docs.stripe.com/stripe-cli), autentifică-te cu `stripe login`, apoi pornește redirecționarea webhook-urilor:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Copiază secretul afișat de comandă (`whsec_...`) în `.env` ca `STRIPE_WEBHOOK_SECRET` și repornește `npm run dev`.
4. Plătește cu cardul de test `4242 4242 4242 4242`, orice dată din viitor, orice CVC.

Comanda este creată cu statusul „În procesare” și devine „Plătită” **doar** după ce webhook-ul Stripe
(cu semnătură verificată) confirmă plata – nu după redirecționarea înapoi pe site. Emailul de confirmare
este simulat: apare în consola serverului.
