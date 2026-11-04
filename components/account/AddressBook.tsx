"use client";

import { startTransition, useActionState, useState, useTransition, type FormEvent } from "react";
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  type AddressFormState,
} from "@/app/cont/actions";
import { FormField, FormMessage, SubmitButton } from "@/components/ui/FormField";
import { COUNTIES } from "@/lib/validation/checkout";

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  county: string;
  postalCode: string;
  isDefault: boolean;
};

export function AddressBook({ addresses, max }: { addresses: SavedAddress[]; max: number }) {
  // null = no form, "new" = add form, otherwise the id being edited
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startAction] = useTransition();

  const editingAddress = addresses.find((a) => a.id === editing);

  return (
    <div>
      {addresses.length === 0 && editing !== "new" && (
        <p className="text-gray-600">Nu ai nicio adresă salvată.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2" aria-busy={isPending}>
        {addresses.map((address) =>
          editing === address.id ? null : (
            <li key={address.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{address.label}</p>
                {address.isDefault && (
                  <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent-800">
                    Implicită
                  </span>
                )}
              </div>
              <address className="mt-2 text-sm not-italic leading-relaxed text-gray-700">
                {address.fullName}
                <br />
                {address.street}
                <br />
                {address.postalCode} {address.city}, jud. {address.county}
                <br />
                Tel. {address.phone}
              </address>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                <button type="button" onClick={() => setEditing(address.id)} className="text-accent-600 hover:underline">
                  Modifică<span className="sr-only"> adresa {address.label}</span>
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => startAction(() => setDefaultAddressAction(address.id))}
                    className="text-accent-600 hover:underline"
                  >
                    Setează ca implicită<span className="sr-only"> adresa {address.label}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Ștergi adresa „${address.label}”?`)) {
                      startAction(() => deleteAddressAction(address.id));
                    }
                  }}
                  className="text-gray-600 hover:text-red-700 hover:underline"
                >
                  Șterge<span className="sr-only"> adresa {address.label}</span>
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing && (
        <AddressForm
          key={editing}
          address={editingAddress}
          onDone={() => setEditing(null)}
        />
      )}

      {!editing && addresses.length < max && (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          + Adaugă o adresă
        </button>
      )}
      {!editing && addresses.length >= max && (
        <p className="mt-4 text-sm text-gray-600">Ai atins numărul maxim de {max} adrese salvate.</p>
      )}
    </div>
  );
}

function AddressForm({ address, onDone }: { address?: SavedAddress; onDone: () => void }) {
  const [state, action, pending] = useActionState<AddressFormState, FormData>(async (prev, data) => {
    const result = await saveAddressAction(prev, data);
    if (result.success) onDone();
    return result;
  }, {});
  const v = state.values ?? address;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4 rounded-xl border border-accent-100 bg-accent-50/40 p-5">
      <h3 className="font-semibold text-gray-900">{address ? `Modifică adresa „${address.label}”` : "Adresă nouă"}</h3>
      {address && <input type="hidden" name="id" value={address.id} />}
      {state.error && <FormMessage type="error">{state.error}</FormMessage>}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nume adresă (ex. Acasă)" name="label" defaultValue={v?.label} error={state.fields?.label} required />
        <FormField label="Nume complet" name="fullName" autoComplete="name" defaultValue={v?.fullName} error={state.fields?.fullName} required />
        <FormField label="Telefon" name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone} error={state.fields?.phone} required />
        <FormField label="Cod poștal" name="postalCode" inputMode="numeric" autoComplete="postal-code" defaultValue={v?.postalCode} error={state.fields?.postalCode} required />
        <FormField
          label="Adresă (stradă, număr, bloc, apartament)"
          name="street"
          autoComplete="street-address"
          defaultValue={v?.street}
          error={state.fields?.street}
          className="sm:col-span-2"
          required
        />
        <FormField label="Localitate" name="city" autoComplete="address-level2" defaultValue={v?.city} error={state.fields?.city} required />
        <div>
          <label htmlFor="address-county" className="block text-sm font-medium text-gray-800">
            Județ
          </label>
          <select
            id="address-county"
            name="county"
            defaultValue={v?.county ?? ""}
            aria-invalid={state.fields?.county ? true : undefined}
            aria-describedby={state.fields?.county ? "address-county-error" : undefined}
            className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 ${
              state.fields?.county ? "border-red-600" : "border-gray-300"
            }`}
          >
            <option value="">Alege județul</option>
            {COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
          {state.fields?.county && (
            <p id="address-county-error" className="mt-1 text-sm text-red-700">
              {state.fields.county}
            </p>
          )}
        </div>
      </div>
      {!address?.isDefault && (
        <label className="flex items-center gap-2 text-sm text-gray-800">
          <input type="checkbox" name="isDefault" className="h-4 w-4 accent-accent-600" />
          Folosește ca adresă implicită
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <SubmitButton pending={pending}>Salvează adresa</SubmitButton>
        </div>
        <button type="button" onClick={onDone} className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Renunță
        </button>
      </div>
    </form>
  );
}
