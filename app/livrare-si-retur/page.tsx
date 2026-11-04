import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Livrare și retur" };

export default function ShippingPage() {
  return (
    <LegalPage title="Livrare și retur">
      <section>
        <h2>Costul livrării</h2>
        <ul>
          <li>gratuită pentru comenzile de peste {formatPrice(FREE_SHIPPING_THRESHOLD)};</li>
          <li>{formatPrice(SHIPPING_COST)} pentru comenzile sub această valoare.</li>
        </ul>
        <p>Valorile sunt de test și se calculează automat în coș.</p>
      </section>
      <section>
        <h2>Termen de livrare</h2>
        <p>
          Într-un magazin real, televizoarele ar fi livrate prin curier în 2–4 zile lucrătoare. În această demonstrație
          statusul comenzii se schimbă doar în baza de date.
        </p>
      </section>
      <section>
        <h2>Retur</h2>
        <p>
          Ca model, un magazin online din România oferă de regulă 14 zile pentru returnarea produselor, fără a fi nevoie
          de o justificare. TV X nu procesează retururi reale.
        </p>
      </section>
    </LegalPage>
  );
}
