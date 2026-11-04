import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/prisma";
import { getProductReviews, getRatingDistribution, type ReviewSort } from "@/lib/products";
import { HelpfulButton } from "./HelpfulButton";
import { RatingSummary } from "./RatingSummary";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";

type ReviewsSectionProps = {
  product: { id: string; slug: string; ratingAvg: number; reviewCount: number };
  sort: ReviewSort;
  user: { id: string } | null;
};

const SORTS: { value: ReviewSort; label: string }[] = [
  { value: "noi", label: "Cele mai noi" },
  { value: "utile", label: "Cele mai utile" },
];

export async function ReviewsSection({ product, sort, user }: ReviewsSectionProps) {
  const [distribution, reviews, votes] = await Promise.all([
    getRatingDistribution(product.id),
    getProductReviews(product.id, sort),
    user
      ? prisma.reviewVote.findMany({
          where: { userId: user.id, review: { productId: product.id } },
          select: { reviewId: true },
        })
      : Promise.resolve([]),
  ]);
  const votedIds = new Set(votes.map((v) => v.reviewId));
  const ownReview = user ? reviews.find((r) => r.userId === user.id) : undefined;
  const productUrl = `/televizoare/${product.slug}`;
  const loginHref = `/autentificare?next=${encodeURIComponent(`${productUrl}#recenzii`)}`;

  return (
    <section aria-labelledby="recenzii-titlu" id="recenzii" className="mt-14 scroll-mt-24">
      <SectionHeading id="recenzii-titlu" title="Recenzii" />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <RatingSummary average={product.ratingAvg} count={product.reviewCount} distribution={distribution} />
        </div>

        <div>
          {/* Write a review */}
          {!user ? (
            <p className="rounded-xl bg-section px-5 py-4 text-sm text-gray-700">
              Ai acest televizor?{" "}
              <Link href={loginHref} className="font-semibold text-accent-600 hover:underline">
                Intră în cont
              </Link>{" "}
              ca să scrii o recenzie.
            </p>
          ) : ownReview ? (
            <p className="rounded-xl bg-section px-5 py-4 text-sm text-gray-700">
              Ai scris o recenzie pentru acest produs – mulțumim! O găsești în listă și în{" "}
              <Link href="/cont#recenzii" className="font-semibold text-accent-600 hover:underline">
                contul tău
              </Link>
              .
            </p>
          ) : (
            <ReviewForm productId={product.id} />
          )}

          {/* Sorting */}
          {reviews.length > 1 && (
            <nav aria-label="Sortare recenzii" className="mt-6 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sortează:</span>
              {SORTS.map((option) => {
                const active = option.value === sort;
                return (
                  <Link
                    key={option.value}
                    href={`${productUrl}${option.value === "noi" ? "" : `?recenzii=${option.value}`}#recenzii`}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    className={`rounded-full border px-3 py-1 font-medium ${
                      active ? "border-accent-600 bg-accent-50 text-accent-800" : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* List */}
          <div className="mt-2">
            {reviews.length ? (
              reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  author={review.user.name}
                  rating={review.rating}
                  text={review.text}
                  createdAt={review.createdAt}
                  verified={review.verified}
                  helpfulCount={review.helpfulCount}
                  actions={
                    <HelpfulButton
                      key={`${review.id}-${review.helpfulCount}-${votedIds.has(review.id)}`}
                      reviewId={review.id}
                      initialVoted={votedIds.has(review.id)}
                      initialCount={review.helpfulCount}
                      mode={!user ? "guest" : review.userId === user.id ? "own" : "user"}
                      loginHref={loginHref}
                    />
                  }
                />
              ))
            ) : (
              <p className="mt-4 text-gray-600">Acest produs nu are încă recenzii. Fii primul care scrie una!</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
