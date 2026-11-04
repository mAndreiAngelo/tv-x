import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: string;
};

/** Labelled input with an accessible error message. */
export function FormField({ label, name, error, hint, id, className, ...props }: FormFieldProps) {
  const inputId = id ?? `field-${name}`;
  const describedBy = [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-800">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`mt-1 block w-full rounded-lg border px-3 py-2 text-gray-900 ${
          error ? "border-red-600" : "border-gray-300 focus:border-accent-600"
        }`}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-gray-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`rounded-lg px-4 py-3 text-sm ${
        type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
      }`}
    >
      {children}
    </p>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent-600 px-4 py-3 font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
    >
      {pending ? "Se trimite…" : children}
    </button>
  );
}
