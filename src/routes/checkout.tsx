import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { createOrder, lookupAddress } from "@/lib/api";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({ meta: [{ title: "Checkout — MA Fashion" }] }),
});

function CheckoutPage() {
  const { detailed, subtotal, count, clear } = useCart();
  const [placed, setPlaced] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [addressHint, setAddressHint] = useState("");
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  if (count === 0 && !placed) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Nothing to check out.</h1>
        <Link
          to="/shop"
          className="mt-6 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest"
        >
          Browse the edit
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-foreground">
          <Check className="h-7 w-7" />
        </div>
        <div className="eyebrow mt-6">Order confirmed</div>
        <h1 className="mt-3 font-serif text-5xl">Thank you.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Bedankt voor je bestelling. We hebben je order{" "}
          <span className="text-foreground">#{placed}</span> ontvangen. Je krijgt eerst een
          orderbevestiging en daarna, zodra je order is verwerkt, een tweede mail met de betaallink.
        </p>
        <Link
          to="/"
          className="mt-10 inline-block bg-foreground px-8 py-4 text-xs uppercase tracking-[0.22em] text-background"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const firstName = String(form.get("first_name") || "").trim();
    const lastName = String(form.get("last_name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const customerCity = String(form.get("customer_city") || "").trim();
    const customerPostalCode = String(form.get("customer_postal_code") || "").trim();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !customerCity ||
      !customerPostalCode
    ) {
      setSubmitting(false);
      setError("Vul alle verplichte velden in om je bestelling te plaatsen.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitting(false);
      setError("Vul een geldig e-mailadres in.");
      return;
    }

    try {
      const order = await createOrder({
        customer_name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        delivery_type: String(form.get("delivery_type") || "verzenden") as "verzenden" | "ophalen",
        address,
        customer_city: customerCity,
        customer_postal_code: customerPostalCode,
        customer_country: String(form.get("customer_country") || "Nederland"),
        coupon_code: String(form.get("coupon_code") || ""),
        notes: String(form.get("notes") || ""),
        items: detailed.map((it) => ({
          product_id: it.product.product_id || it.productId,
          quantity: it.qty,
          size: it.size,
        })),
      });
      clear();
      setPlaced(order.order_id);
      window.scrollTo(0, 0);
    } catch (err) {
      console.warn(err);
      setError("Er ging iets mis bij het plaatsen van je bestelling. Probeer het later opnieuw.");
    } finally {
      setSubmitting(false);
    }
  };

  const tryAddressLookup = async (nextPostal = postalCode, nextHouse = houseNumber) => {
    const normalizedPostal = nextPostal.toUpperCase().replace(/\s+/g, "");
    if (!/^[1-9][0-9]{3}[A-Z]{2}$/.test(normalizedPostal) || !nextHouse.trim()) {
      setAddressHint("");
      return;
    }
    setAddressHint("Adres controleren...");
    try {
      const result = await lookupAddress(normalizedPostal, nextHouse);
      if (result.found && result.street && result.city) {
        setStreet(`${result.street} ${nextHouse}`.trim());
        setCity(result.city);
        setPostalCode(result.postal_code || normalizedPostal);
        setAddressHint("Adres automatisch aangevuld. Controleer het nog even.");
      } else {
        setAddressHint("Adres niet automatisch gevonden. Vul straat en plaats handmatig in.");
      }
    } catch (lookupError) {
      console.warn(lookupError);
      setAddressHint("Adres niet automatisch gevonden. Vul straat en plaats handmatig in.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <h1 className="mb-12 font-serif text-5xl">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_420px]">
        <div className="space-y-12">
          {error && (
            <div className="border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Section title="Contact">
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" required />
          </Section>

          <Section title="Delivery">
            <label className="block">
              <span className="eyebrow mb-1.5 block">Delivery type</span>
              <select
                name="delivery_type"
                required
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              >
                <option value="verzenden">Shipping</option>
                <option value="ophalen">Pickup</option>
              </select>
            </label>
          </Section>

          <Section title="Shipping address">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="first_name" required />
              <Field label="Last name" name="last_name" required />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field
                label="Postal code"
                name="customer_postal_code"
                required
                value={postalCode}
                onChange={(event) => {
                  setPostalCode(event.target.value);
                  void tryAddressLookup(event.target.value, houseNumber);
                }}
                autoComplete="postal-code"
              />
              <Field
                label="House number"
                name="house_number"
                required
                value={houseNumber}
                onChange={(event) => {
                  setHouseNumber(event.target.value);
                  void tryAddressLookup(postalCode, event.target.value);
                }}
                autoComplete="address-line2"
              />
              <Field
                label="City"
                name="customer_city"
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                autoComplete="address-level2"
              />
            </div>
            <Field
              label="Address"
              name="address"
              required
              value={street}
              onChange={(event) => setStreet(event.target.value)}
              autoComplete="street-address"
            />
            {addressHint && <p className="text-xs text-muted-foreground">{addressHint}</p>}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Country" name="customer_country" defaultValue="Nederland" required />
            </div>
          </Section>

          <Section title="Discount">
            <Field label="Coupon code" name="coupon_code" />
            <label className="block">
              <span className="eyebrow mb-1.5 block">Notes</span>
              <textarea
                name="notes"
                rows={4}
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
              />
            </label>
          </Section>

          <section className="border border-border bg-card p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Door te bestellen ga je akkoord met onze{" "}
              <Link to="/disclaimer" className="text-foreground underline-offset-4 hover:underline">
                disclaimer
              </Link>
              .
            </p>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground py-4 text-xs uppercase tracking-[0.22em] text-background hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Bestelling verwerken..."
              : `Bestelling plaatsen - EUR ${total.toFixed(2)}`}
          </button>
        </div>

        <aside className="h-fit border border-border bg-card p-8 lg:sticky lg:top-28">
          <div className="eyebrow mb-4">Your order ({count})</div>
          <ul className="space-y-4">
            {detailed.map((it) => (
              <li key={it.productId + it.size} className="flex gap-3 text-sm">
                <div className="relative h-16 w-14 shrink-0 bg-secondary">
                  {it.product.image && (
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] text-background">
                    {it.qty}
                  </span>
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <div className="font-serif">{it.product.name}</div>
                    {it.product.availability_status === "on_request" && (
                      <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Op aanvraag - verzending vanuit Frankrijk
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {it.product.brand} · {it.size}
                    </div>
                  </div>
                  <div>€{(it.qty * it.product.price).toFixed(2)}</div>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>€{subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt>Total before coupon</dt>
              <dd>€{total.toFixed(2)}</dd>
            </div>
          </dl>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
      />
    </label>
  );
}
