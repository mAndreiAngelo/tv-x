"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { reviewSchema } from "@/lib/validation/review";

export type ReviewFormState = {
  error?: string;
  fields?: FieldErrors;
  success?: boolean;
  values?: { rating?: string; text?: string };
};

/** Keeps the denormalised rating fields (used for filters and sorting) up to date. */
async function recomputeRating(productId: string) {
  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10,
      reviewCount: stats._count,
    },
  });
}

export async function createReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Trebuie să fii autentificat pentru a scrie o recenzie." };

  const values = { rating: String(formData.get("rating") ?? ""), text: String(formData.get("text") ?? "") };
  const parsed = reviewSchema.safeParse({ productId: formData.get("productId"), ...values });
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, slug: true },
  });
  if (!product) return { error: "Produsul nu mai există." };

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    select: { id: true },
  });
  if (existing) return { error: "Ai scris deja o recenzie pentru acest produs." };

  await prisma.review.create({
    data: { userId: user.id, productId: product.id, rating: parsed.data.rating, text: parsed.data.text },
  });
  await recomputeRating(product.id);

  revalidatePath(`/televizoare/${product.slug}`);
  return { success: true };
}

/** Marks a review as helpful (or removes the vote). One vote per user; not on your own review. */
export async function toggleHelpfulAction(reviewId: string) {
  const user = await getCurrentUser();
  if (!user || typeof reviewId !== "string") return { ok: false as const, reason: "login" as const };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, product: { select: { slug: true } } },
  });
  if (!review) return { ok: false as const, reason: "missing" as const };
  if (review.userId === user.id) return { ok: false as const, reason: "own" as const };

  const key = { userId_reviewId: { userId: user.id, reviewId } };
  const voted = await prisma.reviewVote.findUnique({ where: key });

  const updated = await prisma.$transaction(async (tx) => {
    if (voted) {
      await tx.reviewVote.delete({ where: key });
      return tx.review.update({ where: { id: reviewId }, data: { helpfulCount: { decrement: 1 } } });
    }
    await tx.reviewVote.create({ data: { userId: user.id, reviewId } });
    return tx.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } });
  });

  revalidatePath(`/televizoare/${review.product.slug}`);
  return { ok: true as const, voted: !voted, helpfulCount: Math.max(0, updated.helpfulCount) };
}
