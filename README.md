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
