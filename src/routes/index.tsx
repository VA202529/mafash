import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import type { Product } from "@/data/products";
import { getProducts } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["products", "home"],
    queryFn: () => getProducts(),
  });
  const featured = data.slice(0, 4);

  return (
    <div>
      <section className="grid min-h-[80vh] grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-20 md:px-16">
          <div className="eyebrow mb-6">Spring Outlet · No.07</div>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-7xl">
            Luxury labels,
            <br />
            <em className="text-[var(--color-gold)]">honest</em> prices.
          </h1>
          <p className="mt-6 max-w-md text-base text-muted-foreground">
            ALO, Essentials, Fear of God, Stone Island — authenticated, curated, and discounted up
            to seventy percent.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-foreground px-7 py-4 text-xs uppercase tracking-[0.22em] text-background hover:bg-foreground/85"
            >
              Shop the edit
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/shop"
              search={{ category: "Outerwear" }}
              className="inline-flex items-center px-1 text-xs uppercase tracking-[0.22em] underline-offset-8 hover:underline"
            >
              New Outerwear
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden bg-secondary">
          <img
            src={hero}
            alt="MA Fashion campaign"
            className="h-full w-full object-cover"
            width={1080}
            height={1920}
          />
          <div className="absolute bottom-6 right-6 bg-background/90 px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
            Essentials · SS Edit
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-foreground py-6 text-background">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-around gap-x-12 gap-y-4 px-6 font-serif text-2xl tracking-[0.25em] opacity-90">
          <span>ALO YOGA</span>
          <span>ESSENTIALS</span>
          <span>FEAR OF GOD</span>
          <span>STONE ISLAND</span>
          <span>LULULEMON</span>
          <span>NIKE TECH</span>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="eyebrow mb-3">The Edit</div>
            <h2 className="font-serif text-4xl md:text-5xl">Currently coveted.</h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-xs uppercase tracking-[0.22em] underline-offset-8 hover:underline md:block"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.product_id || p.id} p={p} />
          ))}
          {!isLoading && featured.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted-foreground">
              Er staan nog geen actieve producten in de Google Sheet.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-20 text-center md:grid-cols-3">
          {[
            ["100% Authenticated", "Every piece inspected and verified before shipping."],
            ["Outlet Pricing", "Past-season and end-of-line styles from the houses you love."],
            [
              "Worldwide Shipping",
              "Complimentary shipping above the configured threshold, with easy returns.",
            ],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-serif text-2xl">{t}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const off = p.retail > p.price ? Math.round(((p.retail - p.price) / p.retail) * 100) : 0;
  return (
    <Link to="/product/$id" params={{ id: p.product_id || p.id }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            width={1024}
            height={1280}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center font-serif text-2xl text-muted-foreground">
            {p.name}
          </div>
        )}
        {off > 0 && (
          <span className="absolute left-3 top-3 bg-background px-2 py-1 text-[10px] uppercase tracking-widest">
            −{off}%
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {p.brand}
          </div>
          <div className="mt-1 font-serif text-lg leading-tight">{p.name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">€{p.price.toFixed(2)}</div>
          {p.retail > p.price && (
            <div className="text-xs text-muted-foreground line-through">€{p.retail.toFixed(2)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
