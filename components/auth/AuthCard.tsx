import type { ReactNode } from "react";

export function AuthCard({ title, intro, children, footer }: {
  title: string;
  intro?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h1>
        {intro && <p className="mt-1 text-sm text-gray-600">{intro}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-4 text-center text-sm text-gray-600">{footer}</div>}
    </div>
  );
}
