import { z } from "zod";

export const REVIEW_MIN_LENGTH = 30;
export const REVIEW_MAX_LENGTH = 2000;

export const reviewSchema = z.object({
  productId: z.string().min(1).max(50),
  rating: z.coerce
    .number({ error: "Alege un rating între 1 și 5 stele." })
    .int()
    .min(1, { error: "Alege un rating între 1 și 5 stele." })
    .max(5, { error: "Alege un rating între 1 și 5 stele." }),
  text: z
    .string()
    .trim()
    .min(REVIEW_MIN_LENGTH, { error: `Recenzia trebuie să aibă cel puțin ${REVIEW_MIN_LENGTH} de caractere.` })
    .max(REVIEW_MAX_LENGTH, { error: `Recenzia poate avea cel mult ${REVIEW_MAX_LENGTH} de caractere.` }),
});
