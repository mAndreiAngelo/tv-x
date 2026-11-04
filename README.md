# TV X – magazin online de televizoare (proiect demo)

Magazin online demonstrativ, construit pentru curs și portofoliu. Arată și funcționează ca un magazin real
(catalog, filtre, comparator, coș, checkout cu plată prin card, conturi de client, recenzii), dar **nu vinde nimic**:
produsele și brandurile sunt fictive, iar plățile rulează exclusiv în modul de test Stripe.

Specificația completă se află în [`TV - X.md`](TV%20-%20X.md).

> Proiect demonstrativ – nu se efectuează vânzări reale.

## Pornire rapidă

Cerințe: Node.js 20+ (testat cu Node 24) și npm.

```bash
npm install                # instalează pachetele și generează clientul Prisma
cp .env.example .env       # pe Windows funcționează în Git Bash; altfel copiază fișierul manual
npm run db:migrate         # creează baza SQLite (dev.db)
npm run seed               # adaugă datele de test
npm run dev
```

Înainte de prima pornire, completează `NEXTAUTH_SECRET` în `.env` cu un șir aleator, de exemplu:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Site-ul rulează pe http://localhost:3000. Fără cheile Stripe totul funcționează, mai puțin plata
(pagina de checkout afișează un mesaj explicativ).

## Comenzi utile

| Comandă | Ce face |
| --- | --- |
| `npm run dev` | server de dezvoltare |
| `npm run build` / `npm start` | build și server de producție |
| `npm run lint` | verificare ESLint |
| `npm run db:migrate` | aplică migrațiile Prisma |
| `npm run seed` | **resetează** baza și o umple din nou cu date de test (se poate rula oricând) |

## Conturi de test

| Email | Parolă | Descriere |
| --- | --- | --- |
| client@tvx.test | Client123! | client cu 4 comenzi (câte una pe fiecare status), 2 adrese și 2 recenzii |
| nou@tvx.test | Client123! | client nou, fără comenzi |

Seed-ul mai creează 40 de televizoare fictive (branduri inventate: Aurion, Kairo, Lumexa, Nordis, Voltra),
peste 200 de recenzii în română și comenzi istorice pentru eticheta „Cumpărător verificat”.

## Funcționalități

- **Catalog** – grilă de produse, pagină de produs cu galerie, specificații complete, rating și produse similare.
- **Filtre și căutare** – brand, diagonală, rezoluție, tip panou, refresh, sistem de operare, preț, rating minim;
  sortare; filtrele se păstrează în URL. Căutare cu sugestii în timp ce scrii.
- **Comparator** – până la 3 televizoare, bară fixă jos, tabel cu diferențele evidențiate; selecția stă în localStorage.
- **Coș** – localStorage pentru vizitatori, bază de date pentru clienții logați (se unește la autentificare).
  Livrare gratuită peste 1.000 lei, altfel 25 lei. Totalurile se calculează **doar pe server**.
- **Checkout** – date de livrare → Stripe Checkout (test) → pagină de confirmare. Comanda devine „Plătită” doar după
  webhook-ul Stripe.
- **Recenzii** – doar clienți logați, 1–5 stele + minimum 30 de caractere, „Cumpărător verificat”,
  sortare după noutate sau utilitate, buton „Util”.
- **Cont de client** – înregistrare, autentificare, resetare de parolă simulată, istoric comenzi, adrese salvate,
  recenziile proprii.

## Plăți Stripe (doar mod test)

1. Copiază cheile de test din Stripe Dashboard (Developers → API keys, cu „Test mode” activ) în `.env`:
   `STRIPE_SECRET_KEY="sk_test_..."` și `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."`.
   Aplicația refuză cheile live (`sk_live_...`) și evenimentele webhook din modul live.
2. Instalează [Stripe CLI](https://docs.stripe.com/stripe-cli), autentifică-te cu `stripe login`, apoi pornește
   redirecționarea webhook-urilor:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Copiază secretul afișat de comandă (`whsec_...`) în `.env` ca `STRIPE_WEBHOOK_SECRET` și repornește `npm run dev`.
4. Plătește cu cardul de test `4242 4242 4242 4242`, orice dată din viitor, orice CVC.

Comanda este creată cu statusul „În procesare” și devine „Plătită” **doar** după ce webhook-ul Stripe
(cu semnătură verificată) confirmă plata – nu după redirecționarea înapoi pe site. La plată, stocul scade și
produsele cumpărate ies din coș. Dacă plata este anulată, comanda neplătită se șterge și coșul rămâne neschimbat.

## Emailuri simulate

Site-ul nu trimite emailuri. Confirmarea comenzii și linkul de resetare a parolei apar în **consola serverului**
(terminalul în care rulează `npm run dev`), într-un bloc marcat „EMAIL SIMULAT”.

## Stack tehnic

- **Next.js 16** (App Router) cu TypeScript – „Cache Components” este dezactivat intenționat, pentru că aproape
  toate paginile citesc date live (stoc, coș, sesiune).
- **Tailwind CSS 4**
- **Prisma 7** cu SQLite (adaptorul `better-sqlite3`); se poate muta ușor pe PostgreSQL schimbând providerul și adaptorul.
- **Auth.js v5** (`next-auth@beta`) – email + parolă (bcrypt), sesiune JWT.
- **Stripe Checkout** (mod test) + webhook.
- **Zod** pentru validarea formularelor.
- Imagini de produs: SVG-uri generate local, fără poze sau logo-uri reale.

## Structura proiectului

```
app/            pagini și rute (Server Components, Server Actions, Route Handlers)
  api/          căutare (sugestii), Auth.js, webhook Stripe
components/     componente mici și reutilizabile, grupate pe domenii
lib/            logică de business: prețuri, filtre, comenzi, sesiune, Stripe, validări Zod
prisma/         schema, migrațiile și scriptul de seed
auth.ts         configurarea Auth.js
```

Prețurile sunt stocate în bani (1 leu = 100 de bani) și afișate în formatul `2.499,99 lei`, cu TVA inclus.
