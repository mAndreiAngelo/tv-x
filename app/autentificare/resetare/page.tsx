import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetRequestForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Resetare parolă" };

export default function ResetRequestPage() {
  return (
    <AuthCard
      title="Ai uitat parola?"
      intro="Introdu adresa de email a contului și îți trimitem un link de resetare. În această versiune demonstrativă emailul este simulat: linkul apare în consola serverului."
      footer={
        <Link href="/autentificare" className="font-semibold text-accent-600 hover:underline">
          Înapoi la autentificare
        </Link>
      }
    >
      <ResetRequestForm />
    </AuthCard>
  );
}
