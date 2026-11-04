import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Introdu o adresă de email validă." }));

const newPassword = z
  .string()
  .min(8, { error: "Parola trebuie să aibă cel puțin 8 caractere." })
  .max(100, { error: "Parola este prea lungă." })
  .regex(/[A-Za-z]/, { error: "Parola trebuie să conțină cel puțin o literă." })
  .regex(/[0-9]/, { error: "Parola trebuie să conțină cel puțin o cifră." });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Introdu parola." }).max(100),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Numele trebuie să aibă cel puțin 2 caractere." })
      .max(60, { error: "Numele este prea lung." }),
    email,
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Parolele nu coincid.",
    path: ["confirmPassword"],
  });

export const resetRequestSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10).max(200),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Parolele nu coincid.",
    path: ["confirmPassword"],
  });

/** Field errors keyed by field name, ready to show next to inputs. */
export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** Only allow redirects to paths inside this site. */
export function safeRedirect(target: unknown, fallback = "/cont") {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : fallback;
}
