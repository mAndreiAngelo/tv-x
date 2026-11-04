import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getUserId } from "@/lib/session";
import { safeRedirect } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Creează cont" };

export default async function RegisterPage({ searchParams }: PageProps<"/inregistrare">) {
  const next = safeRedirect((await searchParams).next);
  if (await getUserId()) redirect(next);

  return (
    <AuthCard
      title="Creează un cont"
      intro="Contul îți păstrează coșul, comenzile, adresele și recenziile."
      footer={
        <>
          Ai deja cont?{" "}
          <Link href={`/autentificare?next=${encodeURIComponent(next)}`} className="font-semibold text-accent-600 hover:underline">
            Intră în cont
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
