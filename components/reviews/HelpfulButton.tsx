"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleHelpfulAction } from "@/app/televizoare/[slug]/actions";

type HelpfulButtonProps = {
  reviewId: string;
  initialVoted: boolean;
  initialCount: number;
  /** null = guest, "own" = the user's own review */
  mode: "guest" | "own" | "user";
  loginHref: string;
};

export function HelpfulButton({ reviewId, initialVoted, initialCount, mode, loginHref }: HelpfulButtonProps) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const countText =
    count === 0 ? null : count === 1 ? "O persoană a găsit-o utilă" : `${count} persoane au găsit-o utilă`;

  if (mode === "own") {
    return <span className="text-sm text-gray-600">Recenzia ta{countText ? ` · ${countText}` : ""}</span>;
  }

  if (mode === "guest") {
    return (
      <span className="text-sm text-gray-600">
        <Link href={loginHref} className="font-medium text-accent-600 hover:underline">
          Intră în cont
        </Link>{" "}
        ca să marchezi recenzia ca utilă{countText ? ` · ${countText}` : ""}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3 text-sm">
      <button
        type="button"
        aria-pressed={voted}
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleHelpfulAction(reviewId);
            if (result.ok) {
              setVoted(result.voted);
              setCount(result.helpfulCount);
            }
          })
        }
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium transition ${
          voted ? "border-accent-600 bg-accent-50 text-accent-800" : "border-gray-300 text-gray-700 hover:border-gray-400"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path d="M2 9h3v9H2zm4.5 9H15a2 2 0 0 0 2-1.6l1-5A2 2 0 0 0 16 9h-4.5l.7-3.6a1.5 1.5 0 0 0-2.7-1.1L6.5 9z" />
        </svg>
        Util
      </button>
      {countText && <span className="text-gray-600">{countText}</span>}
    </span>
  );
}
