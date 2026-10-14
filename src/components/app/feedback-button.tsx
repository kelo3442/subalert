"use client";

import { LoaderCircle, MessageSquareText } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useRef } from "react";
import { sendFeedback, type FeedbackField } from "@/actions/feedback";
import type { FormState } from "@/actions/form-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { describedBy, Field, Textarea } from "@/components/ui/field";

const initialState: FormState<FeedbackField> = { status: "idle" };

/** "Zgłoś opinię": a short form in a dialog; `variant` picks the trigger's look. */
export function FeedbackButton({ variant = "sidebar" }: { variant?: "sidebar" | "icon" }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [state, action, isPending] = useActionState(sendFeedback, initialState);
  const errors = state.fieldErrors ?? {};
  const sent = state.status === "success";

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg",
          variant === "sidebar" ? "w-full px-3 py-2.5" : "size-10 justify-center",
        )}
        aria-label={variant === "icon" ? "Zgłoś opinię" : undefined}
      >
        <MessageSquareText className="size-[18px]" aria-hidden />
        {variant === "sidebar" && "Zgłoś opinię"}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="feedback-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <form action={action} noValidate className="p-6">
          <h2 id="feedback-title" className="text-lg font-semibold">
            Zgłoś opinię
          </h2>
          <p className="mt-1 text-sm text-muted">Coś nie działa, czegoś brakuje albo coś Ci się podoba? Napisz — czytamy każdą wiadomość.</p>
          {state.message && (
            <Alert tone={sent ? "success" : "error"} className="mt-4">
              {state.message}
            </Alert>
          )}
          {!sent && (
            <>
              <input type="hidden" name="page" value={pathname} />
              <Field id="feedback-message" label="Twoja wiadomość" errors={errors.message} className="mt-4">
                <Textarea
                  id="feedback-message"
                  name="message"
                  rows={5}
                  maxLength={2000}
                  required
                  invalid={Boolean(errors.message)}
                  aria-describedby={describedBy("feedback-message", errors.message)}
                  placeholder="Np. brakuje mi…"
                />
              </Field>
              <p className="mt-2 text-xs text-subtle">Odpowiemy na adres e-mail Twojego konta.</p>
            </>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
              {sent ? "Zamknij" : "Anuluj"}
            </Button>
            {!sent && (
              <Button type="submit" disabled={isPending} aria-busy={isPending}>
                {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden />} Wyślij
              </Button>
            )}
          </div>
        </form>
      </dialog>
    </>
  );
}
