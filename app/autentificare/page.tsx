import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/AuthForms";
import { getUserId } from "@/lib/session";
import { safeRedirect } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Autentificare" };

export default async function LoginPage({ searchParams }: PageProps<"/autentificare">) {
  const next = safeRedirect((await searchParams).next);
  if (await getUserId()) redirect(next);

  return (
    <AuthCard
      title="Intră în cont"
      intro="Conturi de test: client@tvx.test sau nou@tvx.test, parola Client123!"
      footer={
        <>
          Nu ai cont?{" "}
          <Link href={`/inregistrare?next=${encodeURIComponent(next)}`} className="font-semibold text-accent-600 hover:underline">
            Creează un cont
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}
