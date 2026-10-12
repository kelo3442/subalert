"use client";

import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteSubscription } from "@/actions/subscriptions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DeleteSubscriptionButton({ id, name }: { id: string; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteSubscription(id);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <>
      <Button variant="danger" onClick={() => dialogRef.current?.showModal()}>
        <Trash2 className="size-4" aria-hidden /> Usuń
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === dialogRef.current && !isPending) dialogRef.current.close();
        }}
      >
        <div className="p-6">
          <div className="grid size-11 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
            <TriangleAlert className="size-5" aria-hidden />
          </div>
          <h2 id="delete-title" className="mt-4 text-lg font-semibold">
            Usunąć „{name}” z SubAlert?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Usuniemy tę pozycję i jej przypomnienia z Twojego konta.{" "}
            <strong className="font-medium text-fg">To nie anuluje subskrypcji u dostawcy</strong> — jeśli jest aktywna,
            nadal będzie pobierać opłaty.
          </p>
          {error && (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()} disabled={isPending} autoFocus>
              Nie usuwaj
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isPending} aria-busy={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              Usuń z SubAlert
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
