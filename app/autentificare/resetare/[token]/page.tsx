import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Parolă nouă" };

export default async function ResetPasswordPage({ params }: PageProps<"/autentificare/resetare/[token]">) {
  const { token } = await params;
  return (
    <AuthCard title="Alege o parolă nouă">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
