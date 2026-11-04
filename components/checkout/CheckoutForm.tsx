"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { startCheckoutAction, type CheckoutState } from "@/app/checkout/actions";
import { FormField, FormMessage, SubmitButton } from "@/components/ui/FormField";
import { COUNTIES } from "@/lib/validation/checkout";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
};

type ShippingValues = Omit<Address, "id" | "label">;

const EMPTY: ShippingValues = { fullName: "", phone: "", street: "", city: "", county: "", postalCode: "" };

export function CheckoutForm({
  addresses,
  defaultName,
  paymentsReady,
  canPay,
}: {
  addresses: Address[];
  defaultName: string;
  paymentsReady: boolean;
  canPay: boolean;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckoutAction, {});
  const initialAddress = addresses[0];
  const [selected, setSelected] = useState(initialAddress?.id ?? "nou");
  const [values, setValues] = useState<ShippingValues>(initialAddress ?? { ...EMPTY, fullName: defaultName });
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state]);

  const shown = state.values && !pending ? { ...values, ...state.values } : values;

  function pickAddress(id: string) {
    setSelected(id);
    const address = addresses.find((a) => a.id === id);
    setValues(address ?? { ...EMPTY, fullName: defaultName });
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && (
        <div ref={errorRef} tabIndex={-1}>
          <FormMessage type="error">{state.error}</FormMessage>
        </div>
      )}

      {addresses.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Adresele mele</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[...addresses, { id: "nou", label: "Adresă nouă" } as const].map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                  selected === a.id ? "border-accent-600 bg-accent-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="addressChoice"
                  checked={selected === a.id}
                  onChange={() => pickAddress(a.id)}
                  className="mt-0.5 accent-accent-600"
                />
                <span>
                  <span className="block font-semibold text-gray-900">{a.label}</span>
                  {"street" in a && (
                    <span className="block text-gray-600">
                      {a.street}, {a.city}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div key={selected} className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nume complet"
          name="fullName"
          autoComplete="name"
          defaultValue={shown.fullName}
          error={state.fields?.fullName}
          required
        />
        <FormField
          label="Telefon"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={shown.phone}
          error={state.fields?.phone}
          required
        />
        <FormField
          label="Adresă (stradă, număr, bloc, apartament)"
          name="street"
          autoComplete="street-address"
          defaultValue={shown.street}
          error={state.fields?.street}
          className="sm:col-span-2"
          required
        />
        <FormField
          label="Localitate"
          name="city"
          autoComplete="address-level2"
          defaultValue={shown.city}
          error={state.fields?.city}
          required
        />
        <div>
          <label htmlFor="field-county" className="block text-sm font-medium text-gray-800">
            Județ
          </label>
          <select
            id="field-county"
            name="county"
            defaultValue={shown.county}
            aria-invalid={state.fields?.county ? true : undefined}
            aria-describedby={state.fields?.county ? "field-county-error" : undefined}
            className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 ${
              state.fields?.county ? "border-red-600" : "border-gray-300"
            }`}
            required
          >
            <option value="">Alege județul</option>
            {COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
          {state.fields?.county && (
            <p id="field-county-error" className="mt-1 text-sm text-red-700">
              {state.fields.county}
            </p>
          )}
        </div>
        <FormField
          label="Cod poștal"
          name="postalCode"
          inputMode="numeric"
          autoComplete="postal-code"
          defaultValue={shown.postalCode}
          error={state.fields?.postalCode}
          required
        />
      </div>

      {paymentsReady ? (
        <div>
          <SubmitButton pending={pending || !canPay}>Continuă spre plată</SubmitButton>
          <p className="mt-2 text-center text-xs text-gray-500">
            Vei fi redirecționat către Stripe Checkout (mod de test). Card de test: 4242 4242 4242 4242.
          </p>
        </div>
      ) : (
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-600"
        >
          Plata nu este disponibilă
        </button>
      )}
    </form>
  );
}
