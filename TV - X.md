# TV X – magazin online de televizoare (proiect demo)

## Despre proiect

TV X este un magazin online complet de televizoare, construit ca proiect demonstrativ pentru curs și portofoliu. Trebuie să arate și să funcționeze ca un magazin real (catalog, filtre, coș, checkout, plată cu cardul, conturi de client), dar nu vinde nimic pe bune. Toate produsele sunt fictive, iar plățile rulează exclusiv în modul de test Stripe.

Limba site-ului: română. Moneda: RON. Prețurile se afișează cu TVA inclus, în formatul `2.499,99 lei`.

## Stack tehnic

- **Framework:** Next.js (App Router) cu TypeScript
- **Stilizare:** Tailwind CSS
- **Bază de date:** SQLite prin Prisma (suficient pentru demo, ușor de mutat pe PostgreSQL mai târziu)
- **Autentificare:** Auth.js (NextAuth) cu email + parolă
- **Plăți:** Stripe Checkout, doar în mod test, cu webhook pentru confirmarea comenzii
- **Validare formulare:** Zod
- **Imagini produse:** placeholder-e generate local (SVG sau imagini neutre), fără poze reale ale unor branduri

Folosește versiunile stabile curente ale pachetelor. Nu adăuga librării noi fără un motiv clar.

## Funcționalități

### 1. Catalog de produse
- Pagină de listare cu grilă de produse (imagine, nume, diagonală, preț, rating, stoc)
- Pagină de produs cu galerie, specificații tehnice complete, preț, buton „Adaugă în coș”, recenzii
- Produse similare la finalul paginii de produs

### 2. Filtre și căutare
- Căutare după nume și model, cu sugestii în timp ce scrii
- Filtre: brand, diagonală (32″, 43″, 50″, 55″, 65″, 75″, 85″), rezoluție (HD, Full HD, 4K, 8K), tip panou (LED, QLED, OLED, Mini LED), rată de refresh, Smart TV / sistem de operare, interval de preț, rating minim
- Sortare: preț crescător/descrescător, cele mai noi, cele mai bine evaluate
- Filtrele se păstrează în URL, ca să poată fi trimise ca link

### 3. Comparator de modele
- Butonul „Compară” pe fiecare card de produs
- Maximum 3 televizoare în comparație
- Bară fixă jos cu produsele selectate și butonul „Vezi comparația”
- Tabel comparativ cu specificațiile pe rânduri; diferențele sunt evidențiate
- Selecția se păstrează în localStorage

### 4. Recenzii și rating
- Doar clienții logați pot lăsa recenzii
- Rating de la 1 la 5 stele + text (minimum 20 de caractere)
- Eticheta „Cumpărător verificat” dacă utilizatorul a comandat produsul
- Rating mediu și distribuția pe stele afișate pe pagina de produs
- Sortare recenzii: cele mai noi, cele mai utile

### 5. Coș și checkout
- Coș persistent (localStorage pentru vizitatori, bază de date pentru utilizatorii logați)
- Modificare cantitate, ștergere produs, subtotal, cost livrare
- Livrare gratuită peste 1.000 lei, altfel 25 lei (valori de test)
- Checkout: date de livrare → plată prin Stripe Checkout → pagină de confirmare
- Comanda se marchează „plătită” doar după webhook-ul Stripe, nu după redirect
- Email de confirmare simulat (afișat în consolă sau într-un log)

### 6. Cont de client
- Înregistrare, autentificare, resetare parolă (simulată)
- Istoric comenzi cu status (în procesare, plătită, expediată, livrată)
- Adrese salvate
- Recenziile proprii

## Date de test

Generează un seed cu aproximativ 40 de televizoare fictive:
- Branduri inventate (de exemplu Voltra, Nordis, Lumexa, Kairo, Aurion), nu mărci reale
- Distribuție realistă pe diagonale, rezoluții și tipuri de panou
- Prețuri între 900 și 15.000 lei, corelate logic cu specificațiile
- Câteva produse la reducere (preț vechi tăiat + procent)
- 2–3 produse cu stoc 0, ca să se vadă starea „Stoc epuizat”
- 3–8 recenzii pe produs, cu texte variate în română naturală
- 2 conturi de test: un client cu comenzi istorice și un client nou

Comanda de seed trebuie să poată fi rulată oricând pentru resetarea bazei de date.

## Design

Stil curat și luminos, ca marile magazine online:
- Fundal alb, secțiuni separate cu gri foarte deschis
- O singură culoare de accent (albastru) pentru butoane și linkuri
- Roșu doar pentru reduceri și erori, verde pentru „În stoc”
- Font sans-serif modern (Inter sau similar)
- Carduri de produs cu colțuri ușor rotunjite și umbră discretă
- Mult spațiu alb, ierarhie clară a prețului
- Mobile-first, complet responsive
- Accesibilitate: contrast suficient, navigare din tastatură, `alt` pe imagini, etichete pe câmpuri

## Pagini

- `/` – acasă: banner principal, categorii pe diagonale, produse recomandate, produse la reducere
- `/televizoare` – catalog cu filtre
- `/televizoare/[slug]` – pagina de produs
- `/compara` – comparator
- `/cos` – coș
- `/checkout` – date livrare
- `/comanda/succes` și `/comanda/anulata` – după Stripe
- `/cont` – contul clientului (comenzi, adrese, recenzii)
- `/autentificare` și `/inregistrare`
- `/termeni`, `/confidentialitate`, `/livrare-si-retur` – pagini scurte, marcate clar ca text demonstrativ

## Variabile de mediu

Creează un `.env.example` cu:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Nu pune niciodată chei reale în cod sau în repo.

## Reguli de lucru

- Lucrează pe etape, în ordinea: structură proiect → bază de date + seed → catalog → filtre → pagină produs → comparator → coș → autentificare → checkout Stripe → recenzii → cont client → finisaje
- După fiecare etapă, verifică dacă proiectul pornește fără erori (`npm run dev` și `npm run build`)
- Componente mici și reutilizabile, organizate în `components/`
- Logica de business pe server (Server Actions sau Route Handlers), nu în componentele client
- Prețurile se calculează întotdeauna pe server, niciodată din datele trimise de browser
- Texte de interfață în română, cod și comentarii în engleză
- Un banner discret în subsolul fiecărei pagini: „Proiect demonstrativ – nu se efectuează vânzări reale”

## Testare plăți

Plățile se testează cu cardurile de test Stripe (de exemplu `4242 4242 4242 4242`, orice dată viitoare, orice CVC). Webhook-ul se testează local cu Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`).

## Ce NU face

- Nu folosi branduri, logo-uri sau poze reale de televizoare
- Nu activa modul live Stripe
- Nu trimite emailuri reale
- Nu adăuga funcții care nu sunt în acest fișier fără să întrebi mai întâi
