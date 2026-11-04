"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  fieldErrors,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resetRequestSchema,
  safeRedirect,
  type FieldErrors,
} from "@/lib/validation/auth";

export type FormState = {
  error?: string;
  fields?: FieldErrors;
  success?: string;
  values?: Record<string, string>;
};

const RESET_TOKEN_TTL_MINUTES = 30;

function value(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = { email: value(formData, "email"), password: value(formData, "password") };
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values: { email: input.email } };

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeRedirect(formData.get("next")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email sau parolă incorectă.", values: { email: input.email } };
    }
    throw error; // the redirect after a successful sign-in is thrown as an error
  }
  return {};
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = {
    name: value(formData, "name"),
    email: value(formData, "email"),
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
  };
  const parsed = registerSchema.safeParse(input);
  const values = { name: input.name, email: input.email };
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { fields: { email: "Există deja un cont cu această adresă de email." }, values };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: safeRedirect(formData.get("next")),
  });
  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

/** Simulated password reset: the link is printed in the server console instead of being emailed. */
export async function requestPasswordResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = { email: value(formData, "email") };
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values: input };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = randomBytes(24).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    console.log(
      [
        "",
        "──────── EMAIL SIMULAT ────────",
        `Către: ${user.email}`,
        "Subiect: Resetarea parolei TV X",
        `Link (valabil ${RESET_TOKEN_TTL_MINUTES} de minute): ${baseUrl}/autentificare/resetare/${token}`,
        "───────────────────────────────",
        "",
      ].join("\n"),
    );
  }

  // Same answer whether or not the account exists, so emails can't be enumerated
  return {
    success:
      "Dacă există un cont cu această adresă, am trimis un link de resetare. (Demo: linkul apare în consola serverului.)",
  };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = {
    token: value(formData, "token"),
    password: value(formData, "password"),
    confirmPassword: value(formData, "confirmPassword"),
  };
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { fields: fieldErrors(parsed.error) };

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "Linkul de resetare este invalid sau a expirat. Cere unul nou." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 10) },
    }),
    prisma.passwordResetToken.update({ where: { token: record.token }, data: { usedAt: new Date() } }),
  ]);

  return { success: "Parola a fost schimbată. Te poți autentifica acum cu noua parolă." };
}
