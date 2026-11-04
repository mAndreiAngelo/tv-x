/**
 * Seed script for the TV X demo store.
 * Run any time with `npm run seed` – it wipes all data and recreates it.
 * Output is deterministic (fixed PRNG seed), only dates are relative to "now".
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, type OrderStatus, type Product } from "../lib/generated/prisma/client";
import {
  FREE_SHIPPING_THRESHOLD,
  NO_SMART,
  PANEL_LABELS,
  SHIPPING_COST,
  type PanelType,
  type Resolution,
} from "../lib/catalog";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

// ---------------------------------------------------------------------------
// Deterministic random helpers
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261104);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const chance = (p: number) => rand() < p;

function sample<T>(items: readonly T[], count: number) {
  const copy = [...items];
  const result: T[] = [];
  while (result.length < count && copy.length) {
    result.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return result;
}

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();
const daysAgo = (days: number) => new Date(NOW - days * DAY - randInt(0, DAY / 1000) * 1000);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

type ProductDef = {
  brand: string;
  series: string;
  diagonal: number;
  resolution: Resolution;
  panel: PanelType;
  refresh: number;
  os: string;
};

const P = (
  brand: string,
  series: string,
  diagonal: number,
  resolution: Resolution,
  panel: PanelType,
  refresh: number,
  os: string,
): ProductDef => ({ brand, series, diagonal, resolution, panel, refresh, os });

const PRODUCTS: ProductDef[] = [
  // Voltra – mainstream brand, broad range
  P("Voltra", "Home", 32, "HD", "LED", 60, NO_SMART),
  P("Voltra", "Home", 43, "FULL_HD", "LED", 60, "VidaOS"),
  P("Voltra", "Vision", 50, "4K", "LED", 60, "VidaOS"),
  P("Voltra", "Vision", 55, "4K", "QLED", 100, "VidaOS"),
  P("Voltra", "Vision", 65, "4K", "QLED", 120, "VidaOS"),
  P("Voltra", "Neo", 55, "4K", "OLED", 120, "VidaOS"),
  P("Voltra", "Neo", 65, "4K", "OLED", 144, "VidaOS"),
  P("Voltra", "Prime", 75, "8K", "MINI_LED", 120, "VidaOS"),
  // Nordis – Scandinavian-style, QLED / Mini LED
  P("Nordis", "Fjord", 32, "FULL_HD", "LED", 60, "Nimbus TV"),
  P("Nordis", "Fjord", 43, "4K", "LED", 60, "Nimbus TV"),
  P("Nordis", "Fjord", 50, "4K", "LED", 60, "Nimbus TV"),
  P("Nordis", "Aurora", 55, "4K", "QLED", 120, "Nimbus TV"),
  P("Nordis", "Aurora", 65, "4K", "QLED", 120, "Nimbus TV"),
  P("Nordis", "Aurora", 75, "4K", "QLED", 120, "Nimbus TV"),
  P("Nordis", "Polar", 65, "4K", "MINI_LED", 144, "Nimbus TV"),
  P("Nordis", "Polar", 85, "4K", "MINI_LED", 120, "Nimbus TV"),
  // Lumexa – picture quality focus, own OS
  P("Lumexa", "Spark", 32, "HD", "LED", 60, "Lumexa OS"),
  P("Lumexa", "Spark", 43, "FULL_HD", "LED", 60, "Lumexa OS"),
  P("Lumexa", "Glow", 50, "4K", "QLED", 60, "Lumexa OS"),
  P("Lumexa", "Glow", 55, "4K", "QLED", 100, "Lumexa OS"),
  P("Lumexa", "Pure", 55, "4K", "OLED", 120, "Lumexa OS"),
  P("Lumexa", "Pure", 65, "4K", "OLED", 120, "Lumexa OS"),
  P("Lumexa", "Pure", 75, "4K", "OLED", 120, "Lumexa OS"),
  P("Lumexa", "Infinity", 65, "8K", "QLED", 120, "Lumexa OS"),
  // Kairo – value and gaming
  P("Kairo", "Basic", 32, "HD", "LED", 50, NO_SMART),
  P("Kairo", "Street", 43, "4K", "LED", 60, "Orbit Smart"),
  P("Kairo", "Street", 50, "4K", "LED", 60, "Orbit Smart"),
  P("Kairo", "Street", 55, "4K", "LED", 60, "Orbit Smart"),
  P("Kairo", "Arena", 55, "4K", "MINI_LED", 144, "Orbit Smart"),
  P("Kairo", "Arena", 65, "4K", "MINI_LED", 144, "Orbit Smart"),
  P("Kairo", "Max", 75, "4K", "LED", 120, "Orbit Smart"),
  P("Kairo", "Max", 85, "4K", "QLED", 120, "Orbit Smart"),
  // Aurion – premium
  P("Aurion", "Studio", 43, "4K", "QLED", 60, "VidaOS"),
  P("Aurion", "Studio", 50, "4K", "QLED", 100, "VidaOS"),
  P("Aurion", "Studio", 55, "4K", "QLED", 120, "VidaOS"),
  P("Aurion", "Signature", 55, "4K", "OLED", 120, "VidaOS"),
  P("Aurion", "Signature", 65, "4K", "OLED", 144, "VidaOS"),
  P("Aurion", "Signature", 85, "4K", "OLED", 120, "VidaOS"),
  P("Aurion", "Horizon", 65, "8K", "MINI_LED", 120, "VidaOS"),
  P("Aurion", "Horizon", 75, "4K", "MINI_LED", 144, "VidaOS"),
];

// Indexes into PRODUCTS for special states
const DISCOUNTS: Record<number, number> = { 3: 15, 10: 18, 12: 20, 20: 12, 26: 25, 29: 10, 35: 22 };
const OUT_OF_STOCK = new Set([7, 22, 31]);
const FEATURED = new Set([4, 5, 11, 14, 20, 28, 35, 39]);

const DIAGONAL_BASE: Record<number, number> = {
  32: 1250, 43: 1600, 50: 1900, 55: 2300, 65: 3300, 75: 4800, 85: 6500,
};
const PANEL_MULT: Record<PanelType, number> = { LED: 1, QLED: 1.35, MINI_LED: 1.8, OLED: 2.3 };
const RES_MULT: Record<Resolution, number> = { HD: 0.9, FULL_HD: 0.95, "4K": 1, "8K": 1.6 };
const BRAND_MULT: Record<string, number> = {
  Aurion: 1.12, Lumexa: 1.05, Voltra: 1, Nordis: 1, Kairo: 0.9,
};
const REFRESH_MULT: Record<number, number> = { 50: 0.97, 60: 1, 100: 1.04, 120: 1.08, 144: 1.12 };

/** Price in lei, ending in ,99 – correlated with the specs, clamped to 900–15.000 lei. */
function priceFor(p: ProductDef) {
  let lei =
    DIAGONAL_BASE[p.diagonal] *
    PANEL_MULT[p.panel] *
    RES_MULT[p.resolution] *
    BRAND_MULT[p.brand] *
    REFRESH_MULT[p.refresh];
  if (p.os === NO_SMART) lei *= 0.92;
  const step = lei < 2000 ? 50 : 100;
  lei = Math.round(lei / step) * step;
  lei = Math.min(Math.max(lei, 950), 15000);
  return lei * 100 - 1; // bani, e.g. 2.299,99 lei
}

const RES_SHORT: Record<Resolution, string> = { HD: "HD", FULL_HD: "Full HD", "4K": "4K", "8K": "8K" };
const RES_PIXELS: Record<Resolution, string> = {
  HD: "1366 × 768",
  FULL_HD: "1920 × 1080",
  "4K": "3840 × 2160",
  "8K": "7680 × 4320",
};
const BRAND_HUE: Record<string, number> = { Voltra: 215, Nordis: 190, Lumexa: 265, Kairo: 15, Aurion: 40 };
const PANEL_CODE: Record<PanelType, string> = { LED: "L", QLED: "Q", OLED: "O", MINI_LED: "M" };

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const fmtNum = (n: number, digits = 1) =>
  n.toLocaleString("ro-RO", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function specsFor(p: ProductDef, year: number) {
  const cm = Math.round(p.diagonal * 2.54);
  const width = p.diagonal * 2.54 * 0.872;
  const height = width * 0.5625;
  const depth = p.panel === "OLED" ? 4.5 : p.panel === "LED" ? 8.5 : 6.5;
  const weight = p.diagonal * p.diagonal * (p.panel === "OLED" ? 0.0042 : 0.0052);
  const premium = p.panel === "OLED" || p.panel === "MINI_LED";
  const smart = p.os !== NO_SMART;
  const gaming = p.refresh >= 120;
  const brightness = { LED: 350, QLED: 600, OLED: 900, MINI_LED: 1600 }[p.panel];
  const audio = premium ? "2.1 canale, 50 W" : p.diagonal >= 55 ? "2 × 15 W" : "2 × 10 W";
  const energy = premium || p.resolution === "8K" ? "G" : p.diagonal >= 65 ? "F" : "E";
  const power = Math.round(p.diagonal * (premium ? 2.1 : 1.6) * (p.resolution === "8K" ? 1.4 : 1));
  const vesa = p.diagonal <= 43 ? "200 × 200" : p.diagonal <= 55 ? "300 × 300" : "400 × 400";

  return {
    Imagine: {
      Diagonală: `${p.diagonal}″ (${cm} cm)`,
      Rezoluție: `${RES_PIXELS[p.resolution]} (${RES_SHORT[p.resolution]})`,
      "Tip panou": PANEL_LABELS[p.panel],
      "Rată de refresh": `${p.refresh} Hz`,
      HDR: p.resolution === "HD" || p.resolution === "FULL_HD" ? "Nu" : premium ? "HDR10, HDR10+, HLG" : "HDR10, HLG",
      "Luminozitate maximă": `${brightness} cd/m²`,
      "Unghi de vizualizare": p.panel === "OLED" ? "178° / 178°" : "170° / 160°",
    },
    Sunet: {
      "Putere audio": audio,
      "Sunet surround virtual": p.diagonal >= 50 ? "Da" : "Nu",
      "Ajustare automată a volumului": "Da",
    },
    "Smart TV": {
      "Sistem de operare": smart ? p.os : "Nu este Smart TV",
      "Asistent vocal": smart && p.diagonal >= 50 ? "Da, telecomandă cu microfon" : "Nu",
      "Wi-Fi": smart ? (premium ? "Wi-Fi 6" : "Wi-Fi 5") : "Nu",
      Bluetooth: smart ? "5.0" : "Nu",
      "Oglindire ecran telefon": smart ? "Da" : "Nu",
    },
    Conectivitate: {
      HDMI: gaming ? "4 (2 × HDMI 2.1)" : p.diagonal <= 32 ? "2" : "3",
      USB: p.diagonal <= 32 ? "1" : "2",
      Ethernet: smart ? "Da" : "Nu",
      "Ieșire audio optică": p.diagonal <= 32 ? "Nu" : "Da",
      Tuner: "DVB-T2 / DVB-C / DVB-S2",
    },
    Gaming: {
      "Mod joc cu latență redusă": smart ? "Da" : "Nu",
      "Rată de refresh variabilă (VRR)": gaming ? "Da" : "Nu",
      "Latență de intrare": gaming ? "sub 10 ms" : "aprox. 20 ms",
    },
    "Consum și dimensiuni": {
      "Clasă energetică (SDR)": energy,
      "Consum mediu": `${power} W`,
      "Dimensiuni fără stand": `${fmtNum(width)} × ${fmtNum(height)} × ${fmtNum(depth)} cm`,
      Greutate: `${fmtNum(weight)} kg`,
      "Montare pe perete (VESA)": vesa,
    },
    General: {
      "An lansare": String(year),
      Garanție: "24 de luni",
      Culoare: pick(["Negru", "Negru", "Gri închis", "Argintiu"]),
    },
  };
}

const PANEL_PITCH: Record<PanelType, string> = {
  LED: "Panoul LED cu iluminare directă oferă o imagine echilibrată, potrivită pentru utilizarea de zi cu zi.",
  QLED: "Stratul de puncte cuantice redă culori mai saturate și o luminozitate mai mare decât un LED clasic.",
  OLED: "Fiecare pixel se aprinde individual, așa că negrul este negru real, iar contrastul este practic infinit.",
  MINI_LED: "Miile de zone de iluminare locală Mini LED oferă luminozitate foarte mare și un contrast excelent în HDR.",
};

function descriptionFor(p: ProductDef) {
  const size =
    p.diagonal <= 32
      ? "Format compact, ideal pentru dormitor, bucătărie sau camera copiilor."
      : p.diagonal <= 50
        ? "O diagonală potrivită pentru majoritatea sufrageriilor."
        : p.diagonal <= 65
          ? "Diagonala generoasă transformă sufrageria într-o sală de cinema."
          : "Un ecran impresionant, gândit pentru camere mari și pasionați de filme și sport.";
  const smart =
    p.os === NO_SMART
      ? "Modelul nu are funcții Smart TV, ceea ce îl face simplu de folosit."
      : `Sistemul ${p.os} aduce acces rapid la aplicațiile de streaming preferate.`;
  const extra =
    p.refresh >= 120
      ? ` Cu ${p.refresh} Hz și VRR, este o alegere foarte bună pentru console și gaming.`
      : "";
  return `${PANEL_PITCH[p.panel]} ${size} ${smart}${extra}`;
}

// ---------------------------------------------------------------------------
// People and reviews
// ---------------------------------------------------------------------------

const REVIEWER_NAMES = [
  "Andreea M.", "Mihai P.", "Ioana C.", "Bogdan T.", "Elena R.", "Cristian D.", "Alina V.",
  "Radu S.", "Gabriela N.", "Vlad I.", "Diana F.", "Sorin B.", "Corina L.", "Adrian G.",
  "Raluca O.", "Florin M.", "Simona A.", "Marius C.", "Larisa E.", "Ștefan U.", "Oana Z.",
  "Paul H.", "Teodora B.", "Lucian R.", "Irina P.", "Dan V.", "Carmen S.", "Robert K.",
  "Bianca T.", "George A.",
];

const OPENERS = {
  great: [
    "Sunt foarte mulțumit de achiziție.",
    "Cel mai bun televizor pe care l-am avut până acum.",
    "L-am luat pentru sufragerie și nu regret deloc.",
    "Am stat mult să mă hotărăsc, dar a meritat.",
    "Recomand cu încredere.",
    "Peste așteptări, sincer.",
    "Îl folosim de câteva săptămâni și totul merge impecabil.",
    "Raport calitate-preț foarte bun.",
  ],
  good: [
    "Per total, un televizor bun.",
    "Mulțumit, cu mici observații.",
    "Face exact ce promite.",
    "Pentru banii ăștia e o alegere bună.",
    "Îl am de o lună și sunt destul de mulțumit.",
    "O alegere solidă, fără surprize.",
  ],
  mixed: [
    "Are părți bune și părți mai puțin bune.",
    "Mă așteptam la puțin mai mult.",
    "E ok, dar nu m-a impresionat.",
    "Un televizor decent, nimic spectaculos.",
    "Sentimente amestecate după primele săptămâni.",
  ],
  bad: [
    "Din păcate nu sunt mulțumit.",
    "Nu l-aș mai cumpăra.",
    "M-a dezamăgit destul de tare.",
    "Prea multe probleme pentru prețul ăsta.",
  ],
};

const ASPECTS = {
  positive: [
    "Imaginea e clară, iar culorile arată natural, fără să fie exagerate.",
    "Meniurile se mișcă repede și aplicațiile pornesc fără să aștepți.",
    "Instalarea a durat zece minute, inclusiv căutarea canalelor.",
    "Sunetul e surprinzător de bun pentru niște difuzoare integrate.",
    "Telecomanda e simplă și are butoane directe pentru aplicațiile principale.",
    "Ramele sunt subțiri și arată foarte elegant pe perete.",
    "Meciurile se văd fluid, fără efecte de blur la mișcare.",
    "Livrarea a fost rapidă, iar ambalajul foarte bine protejat.",
  ],
  oled: [
    "Negrul este perfect, filmele seara arată spectaculos.",
    "Contrastul e incredibil, nu mă mai uit la alt tip de ecran.",
  ],
  miniLed: [
    "Luminozitatea e foarte mare, se vede bine chiar și cu soare în cameră.",
    "Conținutul HDR arată excelent, cu zone luminoase foarte intense.",
  ],
  gaming: [
    "Pe consolă se simte diferența de la 120 Hz, jocurile rulează foarte fluid.",
    "Modul de joc pornește automat când conectez consola.",
  ],
  budget: [
    "Pentru dormitor e exact ce îmi trebuia, nimic în plus.",
    "Imaginea e corectă pentru diagonala asta, nu ai nevoie de mai mult.",
  ],
  negative: [
    "Sunetul e cam slab, a trebuit să conectez o boxă externă.",
    "Unghiurile de vizualizare nu sunt grozave, din lateral culorile pălesc.",
    "Sistemul de operare se blochează uneori și trebuie repornit.",
    "Telecomanda răspunde greu, mai ales după câteva ore de utilizare.",
    "În scenele întunecate se vede o ușoară neuniformitate a iluminării.",
    "Wi-Fi-ul pierde conexiunea din când în când.",
  ],
};

const CLOSERS = {
  positive: [
    "Aș cumpăra din nou.",
    "Merită fiecare leu.",
    "L-am recomandat deja și prietenilor.",
    "",
    "",
  ],
  negative: ["Sper ca o actualizare de software să rezolve problemele.", "Am cerut deja retur.", ""],
};

function reviewText(rating: number, p: ProductDef) {
  const parts: string[] = [];
  if (rating === 5) parts.push(pick(OPENERS.great));
  else if (rating === 4) parts.push(pick(OPENERS.good));
  else if (rating === 3) parts.push(pick(OPENERS.mixed));
  else parts.push(pick(OPENERS.bad));

  const positivePool = [...ASPECTS.positive];
  if (p.panel === "OLED") positivePool.push(...ASPECTS.oled, ...ASPECTS.oled);
  if (p.panel === "MINI_LED") positivePool.push(...ASPECTS.miniLed, ...ASPECTS.miniLed);
  if (p.refresh >= 120) positivePool.push(...ASPECTS.gaming);
  if (p.diagonal <= 43) positivePool.push(...ASPECTS.budget);

  if (rating >= 4) {
    parts.push(...sample(positivePool, rating === 5 ? 2 : 1));
    if (rating === 4) parts.push(pick(ASPECTS.negative));
    parts.push(pick(CLOSERS.positive));
  } else if (rating === 3) {
    parts.push(pick(positivePool), pick(ASPECTS.negative));
  } else {
    parts.push(...sample(ASPECTS.negative, 2), pick(CLOSERS.negative));
  }
  return parts.filter(Boolean).join(" ");
}

function ratingFor(p: ProductDef) {
  const premium = p.panel === "OLED" || p.panel === "MINI_LED" || p.brand === "Aurion";
  const r = rand();
  if (premium) return r < 0.62 ? 5 : r < 0.88 ? 4 : r < 0.96 ? 3 : 2;
  return r < 0.4 ? 5 : r < 0.72 ? 4 : r < 0.87 ? 3 : r < 0.95 ? 2 : 1;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function reset() {
  await prisma.reviewVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
}

function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

async function main() {
  console.log("Resetting database…");
  await reset();

  // --- Products
  const products: Product[] = [];
  for (const [index, p] of PRODUCTS.entries()) {
    const ageDays = randInt(5, 700);
    const createdAt = daysAgo(ageDays);
    const year = createdAt.getFullYear();
    const name = `${p.brand} ${p.series} ${p.diagonal}″ ${RES_SHORT[p.resolution]} ${PANEL_LABELS[p.panel]}`;
    const model = `${p.brand.slice(0, 2).toUpperCase()}${p.diagonal}${PANEL_CODE[p.panel]}${p.series[0]}${randInt(1, 9)}`;
    const price = priceFor(p);
    const discount = DISCOUNTS[index];
    const oldPrice = discount
      ? (Math.ceil(price / (1 - discount / 100) / 1000) * 1000) - 1
      : null;

    products.push(
      await prisma.product.create({
        data: {
          slug: slugify(`${name} ${model}`),
          name,
          brand: p.brand,
          model,
          description: descriptionFor(p),
          diagonal: p.diagonal,
          resolution: p.resolution,
          panelType: p.panel,
          refreshRate: p.refresh,
          smartOs: p.os,
          price,
          oldPrice,
          stock: OUT_OF_STOCK.has(index) ? 0 : chance(0.2) ? randInt(1, 4) : randInt(5, 40),
          colorHue: BRAND_HUE[p.brand] + randInt(-12, 12),
          featured: FEATURED.has(index),
          specs: specsFor(p, year),
          createdAt,
        },
      }),
    );
  }
  console.log(`Created ${products.length} products`);

  // --- Users
  const testPasswordHash = await bcrypt.hash("Client123!", 10);
  const reviewerHash = await bcrypt.hash(`reviewer-${Math.random()}`, 10);

  const client = await prisma.user.create({
    data: {
      email: "client@tvx.test",
      name: "Maria Popescu",
      passwordHash: testPasswordHash,
      createdAt: daysAgo(400),
      addresses: {
        create: [
          {
            label: "Acasă",
            fullName: "Maria Popescu",
            phone: "0722 000 111",
            street: "Str. Exemplului nr. 12, bl. A3, ap. 7",
            city: "București",
            county: "București",
            postalCode: "030000",
            isDefault: true,
          },
          {
            label: "Birou",
            fullName: "Maria Popescu",
            phone: "0722 000 111",
            street: "Bd. Demonstrației nr. 5, et. 2",
            city: "Cluj-Napoca",
            county: "Cluj",
            postalCode: "400000",
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: { email: "nou@tvx.test", name: "Andrei Ionescu", passwordHash: testPasswordHash },
  });

  const reviewers: { id: string; email: string; name: string }[] = [];
  for (const [i, name] of REVIEWER_NAMES.entries()) {
    reviewers.push(
      await prisma.user.create({
        data: {
          email: `recenzent${i + 1}@tvx.test`,
          name,
          passwordHash: reviewerHash,
          createdAt: daysAgo(720),
        },
      }),
    );
  }

  // --- Orders + reviews
  let orderNumber = 100001;

  async function createOrder(opts: {
    userId: string;
    email: string;
    fullName: string;
    items: { product: (typeof products)[number]; quantity: number }[];
    status: OrderStatus;
    createdAt: Date;
  }) {
    const subtotal = opts.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const shippingCost = shippingFor(subtotal);
    return prisma.order.create({
      data: {
        number: orderNumber++,
        userId: opts.userId,
        status: opts.status,
        email: opts.email,
        fullName: opts.fullName,
        phone: "0700 000 000",
        street: "Str. Demonstrativă nr. 1",
        city: "Brașov",
        county: "Brașov",
        postalCode: "500000",
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        paidAt: opts.status === "PROCESSING" ? null : opts.createdAt,
        createdAt: opts.createdAt,
        items: {
          create: opts.items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            unitPrice: i.product.price,
            quantity: i.quantity,
          })),
        },
      },
    });
  }

  let reviewCount = 0;
  for (const [index, product] of products.entries()) {
    const def = PRODUCTS[index];
    const productAgeDays = Math.floor((NOW - product.createdAt.getTime()) / DAY);
    for (const reviewer of sample(reviewers, randInt(3, 8))) {
      const reviewAge = randInt(0, Math.max(1, productAgeDays - 3));
      const verified = chance(0.6);
      if (verified) {
        await createOrder({
          userId: reviewer.id,
          email: reviewer.email,
          fullName: reviewer.name,
          items: [{ product, quantity: 1 }],
          status: "DELIVERED",
          createdAt: daysAgo(reviewAge + randInt(7, 20)),
        });
      }
      const rating = ratingFor(def);
      await prisma.review.create({
        data: {
          userId: reviewer.id,
          productId: product.id,
          rating,
          text: reviewText(rating, def),
          helpfulCount: randInt(0, 25),
          createdAt: daysAgo(reviewAge),
        },
      });
      reviewCount++;
    }
  }

  // --- Test client order history (one order per status) + own reviews
  const [tvA, tvB, tvC, tvD, tvE] = [products[4], products[17], products[11], products[28], products[0]];
  await createOrder({
    userId: client.id, email: client.email, fullName: client.name,
    items: [{ product: tvA, quantity: 1 }, { product: tvB, quantity: 1 }],
    status: "DELIVERED", createdAt: daysAgo(210),
  });
  await createOrder({
    userId: client.id, email: client.email, fullName: client.name,
    items: [{ product: tvC, quantity: 1 }],
    status: "SHIPPED", createdAt: daysAgo(4),
  });
  await createOrder({
    userId: client.id, email: client.email, fullName: client.name,
    items: [{ product: tvD, quantity: 1 }],
    status: "PAID", createdAt: daysAgo(1),
  });
  await createOrder({
    userId: client.id, email: client.email, fullName: client.name,
    items: [{ product: tvE, quantity: 2 }],
    status: "PROCESSING", createdAt: daysAgo(0),
  });
  await prisma.review.createMany({
    data: [
      {
        userId: client.id,
        productId: tvA.id,
        rating: 5,
        text: "Îl avem în sufragerie de câteva luni. Culorile sunt superbe, iar aplicațiile pornesc foarte repede. Recomand!",
        helpfulCount: 6,
        createdAt: daysAgo(190),
      },
      {
        userId: client.id,
        productId: tvB.id,
        rating: 4,
        text: "Perfect pentru bucătărie. Imaginea e bună, doar sunetul ar putea fi puțin mai puternic.",
        helpfulCount: 2,
        createdAt: daysAgo(185),
      },
    ],
  });
  reviewCount += 2;

  // --- Denormalised rating stats used for filtering and sorting
  for (const product of products) {
    const stats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: product.id },
      data: {
        ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10,
        reviewCount: stats._count,
      },
    });
  }

  console.log(`Created ${reviewCount} reviews and ${orderNumber - 100001} orders`);
  console.log("Test accounts (password Client123!): client@tvx.test, nou@tvx.test");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
