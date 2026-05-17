import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  component: ReturnsPage,
  head: () => ({
    meta: [
      { title: "Returns & Shipping — MA Fashion" },
      { name: "description", content: "MA Fashion return policy: 30-day returns, free shipping over €200, shipped globally from France." },
    ],
  }),
});

function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="eyebrow mb-3">Care</div>
      <h1 className="font-serif text-5xl">Shipping & Returns</h1>
      <p className="mt-6 text-muted-foreground">
        Shipped globally from France. We want you to be fully confident in every piece you receive.
      </p>

      <div className="mt-12 space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl">Shipping</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>· Complimentary standard shipping on orders over €200.</li>
            <li>· Standard delivery within the EU: 2–4 business days.</li>
            <li>· International delivery: 4–8 business days, fully tracked.</li>
            <li>· Duties and taxes outside the EU may apply on delivery.</li>
            <li>· Orders are dispatched from our atelier in France within 24 hours.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl">30-Day Returns</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>· Free returns within 30 days of delivery for EU customers.</li>
            <li>· Items must be unworn, unwashed and returned with all original tags, labels and packaging.</li>
            <li>· Footwear must be tried on a clean, soft surface and returned in the original box (which counts as part of the product).</li>
            <li>· Final-sale items (marked at checkout) and underwear cannot be returned for hygiene reasons.</li>
            <li>· Refunds are issued to the original payment method within 5–10 business days of receipt.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl">How to Return</h2>
          <ol className="mt-4 space-y-2 text-muted-foreground">
            <li>1. Email <a href="mailto:returns@mafashion.com" className="underline">returns@mafashion.com</a> with your order number.</li>
            <li>2. We will issue a prepaid return label within one business day.</li>
            <li>3. Drop the parcel at any partner carrier point.</li>
            <li>4. We refund as soon as your return is inspected and accepted.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Exchanges</h2>
          <p className="mt-4 text-muted-foreground">
            We do not offer direct exchanges. Place a new order for the desired size and return the original piece — your refund will be processed in parallel.
          </p>
        </section>
      </div>
    </div>
  );
}
