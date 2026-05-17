import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Clock, Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — MA Fashion" },
      { name: "description", content: "Get in touch with MA Fashion — customer care, press and wholesale enquiries." },
    ],
  }),
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="eyebrow mb-3">Care</div>
      <h1 className="font-serif text-5xl">Contact</h1>
      <p className="mt-6 max-w-xl text-muted-foreground">
        Our atelier replies within one business day, Monday to Friday.
      </p>

      <div className="mt-16 grid gap-16 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8 text-sm">
          <div className="flex items-start gap-4">
            <Mail className="mt-1 h-4 w-4 text-[var(--color-gold)]" />
            <div>
              <div className="eyebrow mb-1">Email</div>
              <a href="mailto:care@mafashion.com" className="hover:underline">care@mafashion.com</a>
              <div className="mt-1 text-muted-foreground">Press: press@mafashion.com</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="mt-1 h-4 w-4 text-[var(--color-gold)]" />
            <div>
              <div className="eyebrow mb-1">Atelier</div>
              <div>14 rue de Sévigné<br />75004 Paris, France</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="mt-1 h-4 w-4 text-[var(--color-gold)]" />
            <div>
              <div className="eyebrow mb-1">Hours</div>
              <div>Mon — Fri · 10:00 — 18:00 CET</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Instagram className="mt-1 h-4 w-4 text-[var(--color-gold)]" />
            <div>
              <div className="eyebrow mb-1">Social</div>
              <div>@mafashion</div>
            </div>
          </div>
        </div>

        {sent ? (
          <div className="border border-border bg-secondary p-10">
            <h2 className="font-serif text-2xl">Thank you.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your message is on its way. We will reply to you within one business day.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <Field label="Subject" name="subject" required />
            <div>
              <label className="eyebrow mb-2 block">Message</label>
              <textarea required rows={6} className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
            </div>
            <button className="bg-foreground px-8 py-4 text-xs uppercase tracking-[0.22em] text-background hover:bg-foreground/85">
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="eyebrow mb-2 block">{label}</label>
      <input {...rest} className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground" />
    </div>
  );
}
