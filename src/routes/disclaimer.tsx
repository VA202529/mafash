import { createFileRoute, Link } from "@tanstack/react-router";
import { privateSellerDisclaimer } from "@/lib/disclaimer";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
  head: () => ({
    meta: [
      { title: "Disclaimer | MA Fashion" },
      {
        name: "description",
        content:
          "Lees de Mafash disclaimer over particuliere verkoop, productinformatie en klantenservice.",
      },
      { property: "og:title", content: "Disclaimer | MA Fashion" },
      {
        property: "og:description",
        content: "Lees de Mafash disclaimer en voorwaarden rond particuliere verkoop.",
      },
    ],
  }),
});

function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="eyebrow mb-4">Mafash</div>
      <h1 className="font-serif text-5xl md:text-6xl">Disclaimer</h1>
      <div className="mt-8 space-y-5 border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
        {privateSellerDisclaimer.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
      <Link
        to="/shop"
        className="mt-8 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest hover:bg-foreground hover:text-background"
      >
        Terug naar shop
      </Link>
    </div>
  );
}
