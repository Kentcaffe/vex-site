"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { submitFeedback, type SubmitFeedbackResult } from "@/app/actions/feedback";
import { useToast } from "@/components/ui/SimpleToast";

type Props = {
  /** Pe pagina Cont titlul e în header; ascunde H2-ul secțiunii. */
  showHeading?: boolean;
  /** Sufix pentru id-uri când există două formulare pe aceeași pagină. */
  idSuffix?: string;
};

export function ContactFeedbackForm({ showHeading = true, idSuffix = "" }: Props) {
  const t = useTranslations("Contact.feedback");
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  function applyError(r: SubmitFeedbackResult) {
    if (r.ok) return;
    if (r.error === "empty") toast("error", t("errorEmpty"));
    else if (r.error === "too_long") toast("error", t("errorTooLong"));
    else if (r.error === "invalid_email") toast("error", t("errorEmail"));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("message", message);
    fd.set("email", email);
    startTransition(async () => {
      const r = await submitFeedback(fd);
      if (r.ok) {
        toast("success", t("success"));
        setMessage("");
        setEmail("");
      } else {
        applyError(r);
      }
    });
  }

  const mid = `contact-feedback-message${idSuffix}`;
  const eid = `contact-feedback-email${idSuffix}`;

  return (
    <section
      className={showHeading ? "border-t border-zinc-100 pt-8" : ""}
      aria-labelledby={showHeading ? "contact-feedback-heading" : undefined}
    >
      {showHeading ? (
        <h2 id="contact-feedback-heading" className="text-center text-sm font-bold uppercase tracking-[0.12em] text-zinc-500 sm:text-left">
          {t("title")}
        </h2>
      ) : null}
      <form onSubmit={onSubmit} className={`space-y-4 ${showHeading ? "mt-5" : ""}`}>
        <div>
          <label htmlFor={mid} className="sr-only">
            {t("placeholder")}
          </label>
          <textarea
            id={mid}
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("placeholder")}
            className="field-input min-h-[120px] w-full resize-y text-base"
            maxLength={8000}
            required
            disabled={pending}
          />
        </div>
        <div>
          <label htmlFor={eid} className="mb-1.5 block text-xs font-medium text-zinc-500">
            {t("emailLabel")}
          </label>
          <input
            id={eid}
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="field-input w-full"
            autoComplete="email"
            disabled={pending}
          />
        </div>
        <button type="submit" className="btn-primary w-full min-h-[48px] sm:w-auto" disabled={pending}>
          {pending ? t("sending") : t("submit")}
        </button>
      </form>
    </section>
  );
}
