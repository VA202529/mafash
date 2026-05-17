import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Microscope, FileCheck, Stamp } from "lucide-react";

export const Route = createFileRoute("/authenticity")({
  component: AuthenticityPage,
  head: () => ({
    meta: [
      { title: "Authenticity — MA Fashion" },
      { name: "description", content: "Every MA Fashion piece is authenticated in our Paris atelier — a four-step verification on every order." },
    ],
  }),
});

function AuthenticityPage() {
  return (
    <div>
      <section className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <div className="eyebrow mb-4">Our promise</div>
          <h1 className="font-serif text-5xl md:text-6xl">
            100% Authentic.<br /><em className="text-[var(--color-gold)]">Always.</em>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Every piece — from an Essentials hoodie to a Stone Island bomber — is inspected and verified
            by our atelier in Paris before it ships. If it isn't authentic, it doesn't ship.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="grid gap-12 md:grid-cols-4">
          {[
            [ShieldCheck, "Sourced direct", "We buy exclusively from brand-authorised outlets, official distributors and end-of-season stock liquidations."],
            [Microscope, "Inspected", "Stitching, hardware, weight, label fonts, RFID and country-of-origin tags are checked against brand reference."],
            [FileCheck, "Documented", "Every order is photographed and logged. You receive a serialised authenticity card with your parcel."],
            [Stamp, "Guaranteed", "If any piece is ever proven inauthentic, we issue a full refund plus 20% — no questions asked."],
          ].map(([Icon, t, d]) => {
            const I = Icon as React.ComponentType<{ className?: string }>;
            return (
            <div key={t as string}>
              <I className="h-6 w-6 text-[var(--color-gold)]" />
              <h3 className="mt-4 font-serif text-xl">{t as string}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
            </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-foreground py-20 text-background">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-3xl">Have an authenticity question?</h2>
          <p className="mt-4 text-sm text-background/70">
            Our atelier team is happy to verify any piece you've purchased from us.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-block border border-background px-8 py-4 text-xs uppercase tracking-[0.22em] hover:bg-background hover:text-foreground"
          >
            Contact the atelier
          </Link>
        </div>
      </section>
    </div>
  );
}
