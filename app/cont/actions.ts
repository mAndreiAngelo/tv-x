"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { MAX_ADDRESSES, shippingSchema } from "@/lib/validation/checkout";

export type AddressFormState = {
  error?: string;
  fields?: FieldErrors;
  success?: boolean;
  values?: Record<string, string>;
};

const addressSchema = shippingSchema.extend({
  label: z
    .string()
    .trim()
    .min(2, { error: "Dă un nume adresei (ex. Acasă, Birou)." })
    .max(30, { error: "Numele adresei este prea lung." }),
});

const FIELDS = ["label", "fullName", "phone", "street", "city", "county", "postalCode"] as const;

/** Creates or updates a saved address of the signed-in user. */
export async function saveAddressAction(_prev: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sesiunea a expirat. Autentifică-te din nou." };

  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };

  const id = formData.get("id");
  const makeDefault = formData.get("isDefault") === "on";

  if (typeof id === "string" && id) {
    // Update: make sure the address belongs to this user
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!existing) return { error: "Adresa nu a fost găsită.", values };
    await prisma.address.update({ where: { id }, data: parsed.data });
  } else {
    const count = await prisma.address.count({ where: { userId: user.id } });
    if (count >= MAX_ADDRESSES) return { error: `Poți salva cel mult ${MAX_ADDRESSES} adrese.`, values };
    const created = await prisma.address.create({
      data: { ...parsed.data, userId: user.id, isDefault: count === 0 },
    });
    if (makeDefault) await setDefault(user.id, created.id);
    revalidatePath("/cont");
    return { success: true };
  }

  if (makeDefault) await setDefault(user.id, id);
  revalidatePath("/cont");
  return { success: true };
}

async function setDefault(userId: string, addressId: string) {
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id: addressId, userId }, data: { isDefault: true } }),
  ]);
}

export async function setDefaultAddressAction(addressId: string) {
  const user = await getCurrentUser();
  if (!user || typeof addressId !== "string") return;
  await setDefault(user.id, addressId);
  revalidatePath("/cont");
}

export async function deleteAddressAction(addressId: string) {
  const user = await getCurrentUser();
  if (!user || typeof addressId !== "string") return;
  const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!address) return;
  await prisma.address.delete({ where: { id: address.id } });

  // Keep one default address if any remain
  if (address.isDefault) {
    const next = await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/cont");
}
