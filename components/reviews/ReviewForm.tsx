"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { createReviewAction, type ReviewFormState } from "@/app/televizoare/[slug]/actions";
import { FormMessage, SubmitButton } from "@/components/ui/FormField";
import { REVIEW_MAX_LENGTH, REVIEW_MIN_LENGTH } from "@/lib/validation/review";

const LABELS = ["", "Foarte slab", "Slab", "Acceptabil", "Bun", "Excelent"];

export function ReviewForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(createReviewAction, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");

  if (state.success) {
    return <FormMessage type="success">Mulțumim! Recenzia ta a fost publicată.</FormMessage>;
  }

  const shown = hover || rating;
  const length = text.trim().length;
  // Server errors disappear as soon as the field is fixed
  const ratingError = rating ? undefined : state.fields?.rating;
  const textError = length >= REVIEW_MIN_LENGTH ? undefined : state.fields?.text;

  // Submit manually: the automatic form reset of React form actions would uncheck the rating
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-200 p-5" noValidate>
      <h3 className="text-lg font-semibold text-gray-900">Scrie o recenzie</h3>
      <input type="hidden" name="productId" value={productId} />
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}

      <fieldset>
        <legend className="text-sm font-medium text-gray-800">Rating</legend>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="cursor-pointer" onMouseEnter={() => setHover(value)}>
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  className="peer sr-only"
                  aria-describedby={ratingError ? "rating-error" : undefined}
                />
                <span className="sr-only">
                  {value} {value === 1 ? "stea" : "stele"} – {LABELS[value]}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-8 w-8 rounded peer-focus-visible:outline-2 peer-focus-visible:outline-accent-600"
                >
                  <path
                    d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
                    fill={value <= shown ? "#f59e0b" : "#d1d5db"}
                  />
                </svg>
              </label>
            ))}
          </div>
          <span className="text-sm text-gray-600" aria-hidden="true">
            {LABELS[shown]}
          </span>
        </div>
        {ratingError && (
          <p id="rating-error" className="mt-1 text-sm text-red-700">
            {ratingError}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="review-text" className="block text-sm font-medium text-gray-800">
          Părerea ta
        </label>
        <textarea
          id="review-text"
          name="text"
          rows={5}
          maxLength={REVIEW_MAX_LENGTH}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-invalid={textError ? true : undefined}
          aria-describedby="review-text-help"
          placeholder="Cum ți se pare imaginea, sunetul, sistemul Smart TV? Ai recomanda televizorul?"
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-gray-900 ${
            textError ? "border-red-600" : "border-gray-300"
          }`}
        />
        <p id="review-text-help" className={`mt-1 text-sm ${textError ? "text-red-700" : "text-gray-500"}`}>
          {textError ??
            (length < REVIEW_MIN_LENGTH
              ? `Minimum ${REVIEW_MIN_LENGTH} de caractere (mai ai ${REVIEW_MIN_LENGTH - length}).`
              : `${length} caractere`)}
        </p>
      </div>

      <div className="sm:w-60">
        <SubmitButton pending={pending}>Publică recenzia</SubmitButton>
      </div>
    </form>
  );
}
