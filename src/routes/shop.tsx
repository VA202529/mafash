import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { z } from "zod";
import type { Product } from "@/data/products";
import { getProductsPage, type ProductPageResult } from "@/lib/api";

type ShopCategory = "Tops" | "Bottoms" | "Outerwear" | "Footwear" | "Accessories";

const search = z.object({
  category: z.enum(["Tops", "Bottoms", "Outerwear", "Footwear", "Accessories"]).optional(),
  brand: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => search.parse(s),
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop MA Fashion | Authenticated outlet fashion" },
      {
        name: "description",
        content:
          "Shop authenticated outlet fashion from Mafash. Discover curated clothing, footwear and essentials with fast product browsing.",
      },
      { property: "og:title", content: "Shop MA Fashion" },
      {
        property: "og:description",
        content: "Browse authenticated outlet fashion and curated essentials from Mafash.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

const categories: Array<"All" | ShopCategory> = ["All", "Tops", "Bottoms", "Outerwear", "Footwear"];
const PAGE_SIZE = 12;

function ShopPage() {
  const { category, brand, page = 1 } = Route.useSearch();
  const [query, setQuery] = useState("");
  const fallbackPage: ProductPageResult = {
    items: [],
    total: 0,
    page,
    limit: PAGE_SIZE,
    page_count: 1,
    has_next: false,
    has_previous: false,
  };
  const {
    data = fallbackPage,
    isLoading,
    isFetching,
    error,
  } = useQuery<ProductPageResult>({
    queryKey: ["products-page", category || "all", brand || "all", page],
    queryFn: () => getProductsPage({ category, brand, page, limit: PAGE_SIZE }),
    staleTime: 60_000,
  });

  const brands = useMemo(
    () => Array.from(new Set(data.items.map((p) => p.brand))).sort(),
    [data.items],
  );
  const q = query.trim().toLowerCase();
  const list = data.items.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
  const pageNumbers = Array.from({ length: data.page_count }, (_, index) => index + 1).slice(0, 7);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-6 md:py-12">
      <div className="mb-8 border-b border-border pb-8">
        <div className="eyebrow mb-3">
          {isLoading ? "Collectie laden" : `${data.total} producten gevonden`}
          {isFetching && !isLoading ? " - bijwerken" : ""}
        </div>
        <h1 className="font-serif text-4xl md:text-6xl">{category ?? brand ?? "The Edit"}</h1>
        <div className="mt-8 flex max-w-xl items-center gap-3 border-b border-foreground py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op naam, merk of categorie"
            className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Zoeken wissen"
              className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground"
            >
              <X className="mx-auto h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <aside className="grid grid-cols-2 gap-6 md:block md:space-y-8">
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

        <div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {isLoading &&
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/5] bg-secondary" />
                  <div className="mt-4 h-3 w-20 bg-secondary" />
                  <div className="mt-3 h-6 w-4/5 bg-secondary" />
                  <div className="mt-3 h-2 w-10 bg-foreground/30" />
                </div>
              ))}
            {!isLoading &&
              !error &&
              list.map((p) => <ProductCard key={p.product_id || p.id} p={p} />)}
          </div>

          {!isLoading && error && (
            <p className="py-20 text-center text-muted-foreground">
              Er ging iets mis bij het laden van de producten. Probeer het later opnieuw.
            </p>
          )}
          {!isLoading && !error && data.total === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              Er zijn momenteel geen producten beschikbaar. Kom later terug.
            </p>
          )}
          {!isLoading && !error && data.total > 0 && list.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              Geen producten gevonden met deze zoekterm.
            </p>
          )}

          {data.total > PAGE_SIZE && (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <PageLink label="Vorige" page={Math.max(1, page - 1)} disabled={!data.has_previous} />
              {pageNumbers.map((pageNumber) => (
                <PageLink
                  key={pageNumber}
                  label={String(pageNumber)}
                  page={pageNumber}
                  active={pageNumber === page}
                />
              ))}
              <PageLink
                label="Volgende"
                page={Math.min(data.page_count, page + 1)}
                disabled={!data.has_next}
              />
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function PageLink({
  label,
  page,
  active,
  disabled,
}: {
  label: string;
  page: number;
  active?: boolean;
  disabled?: boolean;
}) {
  const { category, brand } = Route.useSearch();
  if (disabled) {
    return (
      <span className="min-h-11 min-w-11 border border-border px-4 py-3 text-center text-xs uppercase tracking-widest text-muted-foreground opacity-40">
        {label}
      </span>
    );
  }
  return (
    <Link
      to="/shop"
      search={{ ...(category ? { category } : {}), ...(brand ? { brand } : {}), page }}
      className={
        "min-h-11 min-w-11 border px-4 py-3 text-center text-xs uppercase tracking-widest " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:border-foreground")
      }
    >
      {label}
    </Link>
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
            alt={`${p.name} van ${p.brand}`}
            loading="lazy"
            decoding="async"
            width={640}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {p.brand}
          </div>
          <h2 className="mt-1 font-serif text-lg leading-tight">{p.name}</h2>
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
