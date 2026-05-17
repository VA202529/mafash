import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Shopping Bag — MA Fashion" }] }),
});

function CartPage() {
  const { detailed, setQty, remove, subtotal, count } = useCart();
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <div className="eyebrow mb-4">Your bag</div>
        <h1 className="font-serif text-5xl">Your bag is empty.</h1>
        <p className="mt-4 text-sm text-muted-foreground">Discover this season's outlet edit.</p>
        <Link to="/shop" className="mt-8 inline-block bg-foreground px-8 py-4 text-xs uppercase tracking-[0.22em] text-background">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <h1 className="mb-12 font-serif text-5xl">Shopping bag</h1>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-border border-y border-border">
          {detailed.map((it) => (
            <li key={it.productId + it.size} className="flex gap-6 py-6">
              <Link to="/product/$id" params={{ id: it.productId }} className="w-28 shrink-0 bg-secondary">
                <img src={it.product.image} alt={it.product.name} width={400} height={500} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{it.product.brand}</div>
                    <Link to="/product/$id" params={{ id: it.productId }} className="mt-1 block font-serif text-xl hover:underline">
                      {it.product.name}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">Size {it.size}</div>
                  </div>
                  <button onClick={() => remove(it.productId, it.size)} aria-label="Remove" className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="inline-flex items-center border border-border">
                    <button onClick={() => setQty(it.productId, it.size, it.qty - 1)} className="px-3 py-2 hover:bg-secondary" aria-label="Decrease">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-8 text-center text-sm">{it.qty}</span>
                    <button onClick={() => setQty(it.productId, it.size, it.qty + 1)} className="px-3 py-2 hover:bg-secondary" aria-label="Increase">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-sm">€{it.qty * it.product.price}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-border bg-card p-8">
          <div className="eyebrow mb-4">Order summary</div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>€{subtotal}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Complimentary" : `€${shipping}`}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base"><dt>Total</dt><dd>€{total}</dd></div>
          </dl>
          <Link to="/checkout" className="mt-6 block bg-foreground py-4 text-center text-xs uppercase tracking-[0.22em] text-background hover:bg-foreground/85">
            Checkout
          </Link>
          <Link to="/shop" className="mt-3 block py-2 text-center text-xs uppercase tracking-[0.22em] underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
