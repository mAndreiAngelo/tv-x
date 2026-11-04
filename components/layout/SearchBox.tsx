"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { formatPrice } from "@/lib/format";

type Suggestion = { slug: string; name: string; model: string; price: number };

/** Search field with live suggestions (accessible combobox pattern). */
export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced fetch of suggestions
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data: { suggestions: Suggestion[] } = await res.json();
        setSuggestions(data.suggestions);
        setActive(-1);
        setOpen(true);
      } catch {
        // aborted or network error – keep previous suggestions
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const visible = open && query.trim().length >= 2;

  function goToProduct(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/televizoare/${slug}`);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (visible && active >= 0 && suggestions[active]) {
      goToProduct(suggestions[active].slug);
      return;
    }
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/televizoare?q=${encodeURIComponent(q)}` : "/televizoare");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form role="search" action="/televizoare" onSubmit={onSubmit}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Caută televizoare
        </label>
        <input
          id={`${listId}-input`}
          name="q"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value.trim().length < 2) setSuggestions([]);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Caută după nume sau model…"
          role="combobox"
          aria-expanded={visible && suggestions.length > 0}
          aria-controls={`${listId}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          className="w-full rounded-lg border border-gray-300 bg-section py-2 pl-3 pr-10 text-sm text-gray-900 placeholder:text-gray-500 focus:border-accent-600 focus:bg-white"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-accent-600"
        >
          <span className="sr-only">Caută</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l4 4" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <ul
        id={`${listId}-list`}
        role="listbox"
        aria-label="Sugestii"
        className={`absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg ${
          visible ? "" : "hidden"
        }`}
      >
        {suggestions.map((s, i) => (
          <li
            key={s.slug}
            id={`${listId}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseEnter={() => setActive(i)}
            onClick={() => goToProduct(s.slug)}
            className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
              i === active ? "bg-accent-50" : ""
            }`}
          >
            <span>
              <span className="block font-medium text-gray-900">{s.name}</span>
              <span className="block text-xs text-gray-500">Model {s.model}</span>
            </span>
            <span className="whitespace-nowrap font-semibold text-gray-900">{formatPrice(s.price)}</span>
          </li>
        ))}
        {visible && suggestions.length === 0 && (
          <li className="px-3 py-2 text-sm text-gray-600">Nicio sugestie. Apasă Enter pentru a căuta.</li>
        )}
      </ul>
    </div>
  );
}
