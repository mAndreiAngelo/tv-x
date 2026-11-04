import type { Metadata } from "next";
import { logoutAction } from "@/app/autentificare/actions";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Contul meu" };

export default async function AccountPage() {
  const user = await requireUser("/cont");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Contul meu</h1>
          <p className="mt-1 text-gray-600">
            Bun venit, {user.name}! ({user.email})
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            Ieși din cont
          </button>
        </form>
      </div>
    </div>
  );
}
