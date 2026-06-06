import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/data/products";
import { getProducts } from "@/lib/api";

type ShopCategory = "Tops" | "Bottoms" | "Outerwear" | "Footwear" | "Accessories";

const search = z.object({
  category: z.enum(["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories"]).optional(),
  brand: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => search.parse(s),
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop - MA Fashion" },
      { name: "description", content: "All products - outlet luxury essentials." },
    ],
  }),
});

const categories: Array<"All" | ShopCategory> = ["All", "Tops", "Bottoms", "Outerwear", "Footwear"];

function ShopPage() {
  const { category, brand } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [loadFullProducts, setLoadFullProducts] = useState(false);
  const { data: firstProducts = [], isLoading: isFirstLoading } = useQuery({
    queryKey: ["products", category || "all", brand || "all", "first"],
    queryFn: () => getProducts({ category, brand, limit: 5 }),
    staleTime: 60_000,
  });
  const { data: fullProducts = [], isFetching: isFullFetching } = useQuery({
    queryKey: ["products", category || "all", brand || "all", "full"],
    queryFn: () => getProducts({ category, brand }),
    enabled: loadFullProducts,
  });

  useEffect(() => {
    setLoadFullProducts(false);
  }, [category, brand]);

  useEffect(() => {
    if (firstProducts.length) {
      const timer = window.setTimeout(() => setLoadFullProducts(true), 80);
      return () => window.clearTimeout(timer);
    }
  }, [firstProducts.length]);

  const data = fullProducts.length ? fullProducts : firstProducts;
  const isLoading = isFirstLoading && !firstProducts.length;
  const brands = useMemo(() => Array.from(new Set(data.map((p) => p.brand))).sort(), [data]);
  const q = query.trim().toLowerCase();
  const list = data.filter(
    (p) =>
      (!category || p.category === category) &&
      (!brand || p.brand === brand) &&
      (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <div className="mb-10 border-b border-border pb-8">
        <div className="eyebrow mb-3">
          Outlet - {isLoading ? "loading" : `${list.length} pieces`}
          {isFullFetching && firstProducts.length > 0 ? " - aanvullen" : ""}
        </div>
        <h1 className="font-serif text-5xl md:text-6xl">{category ?? brand ?? "The Edit"}</h1>
        <div className="mt-8 flex max-w-xl items-center gap-3 border-b border-foreground py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or brand..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr]">
        <aside className="space-y-8">
          <div>
            <div className="eyebrow mb-3">Category</div>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    to="/shop"
                    search={c === "All" ? {} : { category: c }}
                    className={
                      category === c || (!category && c === "All")
                        ? "text-foreground underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-3">Brand</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/shop"
                  search={category ? { category } : {}}
                  className={
                    !brand
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  All brands
                </Link>
              </li>
              {brands.map((b) => (
                <li key={b}>
                  <Link
                    to="/shop"
                    search={{ ...(category ? { category } : {}), brand: b }}
                    className={
                      brand === b
                        ? "text-foreground underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-secondary" />
                <div className="mt-4 h-3 w-20 bg-secondary" />
                <div className="mt-3 h-6 w-4/5 bg-secondary" />
                <div className="mt-3 h-2 w-10 animate-pulse bg-foreground/30" />
              </div>
            ))}
          {list.map((p) => (
            <ProductCard key={p.product_id || p.id} p={p} />
          ))}
          {!isLoading && list.length === 0 && (
            <p className="col-span-full py-20 text-center text-muted-foreground">
              Geen actieve producten gevonden in de Google Sheet.
            </p>
          )}
        </div>
      </div>
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
            -{off}%
          </span>
        )}
        <span className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 text-[10px] uppercase tracking-widest">
          {p.availability_label || "Op aanvraag"}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {p.brand}
          </div>
          <div className="mt-1 font-serif text-lg leading-tight">{p.name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">EUR {p.price.toFixed(2)}</div>
          {p.retail > p.price && (
            <div className="text-xs text-muted-foreground line-through">
              EUR {p.retail.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
