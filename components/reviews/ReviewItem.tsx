import type { ReactNode } from "react";
import { Stars } from "@/components/product/Stars";
import { formatDate } from "@/lib/format";

type ReviewItemProps = {
  author: string;
  rating: number;
  text: string;
  createdAt: Date;
  verified: boolean;
  helpfulCount: number;
  /** Optional slot for the "Util" button; replaces the plain helpful count. */
  actions?: ReactNode;
};

export function ReviewItem({ author, rating, text, createdAt, verified, helpfulCount, actions }: ReviewItemProps) {
  return (
    <article className="border-b border-gray-200 py-5 last:border-0">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars rating={rating} />
        <p className="font-semibold text-gray-900">{author}</p>
        {verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M8 13.6 4.4 10l-1.4 1.4L8 16.4l9-9L15.6 6z" />
            </svg>
            Cumpărător verificat
          </span>
        )}
        <time dateTime={createdAt.toISOString()} className="text-sm text-gray-600">
          {formatDate(createdAt)}
        </time>
      </header>
      <p className="mt-2 leading-relaxed text-gray-800">{text}</p>
      <footer className="mt-3 flex items-center gap-3 text-sm text-gray-600">
        {actions ??
          (helpfulCount > 0 && (
            <span>{helpfulCount === 1 ? "O persoană a găsit-o utilă" : `${helpfulCount} persoane au găsit-o utilă`}</span>
          ))}
      </footer>
    </article>
  );
}
