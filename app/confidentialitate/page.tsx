import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Politica de confidențialitate" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Politica de confidențialitate">
      <section>
        <h2>Ce date folosim</h2>
        <ul>
          <li>numele, adresa de email și parola (stocată doar sub formă criptată) pentru cont;</li>
          <li>adresele de livrare pe care alegi să le salvezi;</li>
          <li>istoricul comenzilor de test și recenziile scrise de tine.</li>
        </ul>
      </section>
      <section>
        <h2>Unde sunt păstrate</h2>
        <p>
          Datele sunt păstrate într-o bază de date locală, folosită doar pentru demonstrație. Coșul vizitatorilor și
          lista de produse pentru comparație sunt salvate în browser (localStorage).
        </p>
      </section>
      <section>
        <h2>Plăți</h2>
        <p>
          Datele cardului sunt introduse direct pe pagina Stripe (mod de test) și nu ajung niciodată pe serverul TV X.
        </p>
      </section>
      <section>
        <h2>Emailuri</h2>
        <p>Site-ul nu trimite emailuri reale. Mesajele de confirmare și resetare a parolei sunt doar simulate.</p>
      </section>
      <section>
        <h2>Cookie-uri</h2>
        <p>Folosim un singur cookie esențial, pentru sesiunea de autentificare. Nu folosim cookie-uri de marketing.</p>
      </section>
    </LegalPage>
  );
}
