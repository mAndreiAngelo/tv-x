import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Termeni și condiții" };

export default function TermsPage() {
  return (
    <LegalPage title="Termeni și condiții">
      <section>
        <h2>1. Despre site</h2>
        <p>
          TV X este un magazin online demonstrativ, creat în scop educațional. Produsele, brandurile, prețurile și
          recenziile sunt fictive.
        </p>
      </section>
      <section>
        <h2>2. Comenzi</h2>
        <p>
          Poți plasa comenzi de test după ce îți creezi un cont. O comandă este considerată plătită doar după ce
          procesatorul de plăți confirmă tranzacția. Nicio comandă nu este livrată efectiv.
        </p>
      </section>
      <section>
        <h2>3. Prețuri</h2>
        <p>Prețurile sunt afișate în lei (RON) și includ TVA. Valorile sunt inventate și pot fi modificate oricând.</p>
      </section>
      <section>
        <h2>4. Plăți</h2>
        <p>
          Plățile rulează exclusiv în modul de test Stripe. Folosește doar carduri de test (de exemplu 4242 4242 4242
          4242). Nu introduce datele unui card real.
        </p>
      </section>
      <section>
        <h2>5. Recenzii</h2>
        <p>
          Recenziile pot fi scrise doar de utilizatorii autentificați și trebuie să respecte bunul-simț. Eticheta
          „Cumpărător verificat” apare când autorul are o comandă plătită pentru produsul respectiv.
        </p>
      </section>
    </LegalPage>
  );
}
