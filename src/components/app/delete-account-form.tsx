"use client";

import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react";
import { useActionState, useRef } from "react";
import { deleteAccount } from "@/actions/auth";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input } from "@/components/ui/field";
import { DELETE_ACCOUNT_CONFIRMATION, type DeleteAccountField } from "@/lib/validation/auth";

const initialState: FormState<DeleteAccountField> = { status: "idle" };

export function DeleteAccountForm() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, isPending] = useActionState(deleteAccount, initialState);
  const errors = state.fieldErrors ?? {};

  return (
    <>
      <Button variant="danger" onClick={() => dialogRef.current?.showModal()}>
        <Trash2 className="size-4" aria-hidden /> Usuń konto
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-account-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <form action={action} noValidate className="p-6">
          <div className="grid size-11 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
            <TriangleAlert className="size-5" aria-hidden />
          </div>
          <h2 id="delete-account-title" className="mt-4 text-lg font-semibold">
            Usunąć konto w Opłaciku?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Trwale usuniemy konto, wszystkie zapisane subskrypcje, ustawienia i historię przypomnień. Tej operacji nie
            można cofnąć. <strong className="font-medium text-fg">Subskrypcje u dostawców pozostaną aktywne</strong> —
            anuluj je osobno, jeśli chcesz.
          </p>
          {state.message && (
            <Alert tone="error" className="mt-4">
              {state.message}
            </Alert>
          )}
          <Field
            id="confirmation"
            label={`Wpisz ${DELETE_ACCOUNT_CONFIRMATION}, aby potwierdzić`}
            errors={errors.confirmation}
            className="mt-4"
          >
            <Input
              id="confirmation"
              name="confirmation"
              autoComplete="off"
              invalid={Boolean(errors.confirmation)}
              aria-describedby={describedBy("confirmation", errors.confirmation)}
            />
          </Field>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()} disabled={isPending} autoFocus>
              Anuluj
            </Button>
            <Button type="submit" variant="danger" disabled={isPending} aria-busy={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              Usuń konto na zawsze
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
