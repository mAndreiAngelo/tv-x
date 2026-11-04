import { z } from "zod";

export const shippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { error: "Introdu numele complet." })
    .max(80, { error: "Numele este prea lung." }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+4|0)[0-9 ]{9,13}$/, { error: "Introdu un număr de telefon valid (ex. 0722 123 456)." }),
  street: z
    .string()
    .trim()
    .min(5, { error: "Introdu adresa completă (stradă, număr, bloc, apartament)." })
    .max(150, { error: "Adresa este prea lungă." }),
  city: z.string().trim().min(2, { error: "Introdu localitatea." }).max(60),
  county: z.string().trim().min(2, { error: "Alege județul." }).max(60),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, { error: "Codul poștal are 6 cifre." }),
});

export type ShippingInput = z.infer<typeof shippingSchema>;

export const COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila", "București",
  "Buzău", "Caraș-Severin", "Călărași", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați",
  "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș",
  "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea",
  "Vaslui", "Vâlcea", "Vrancea",
] as const;
