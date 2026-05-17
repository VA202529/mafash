import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/data/products";
import { getProductDetails, getProducts } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { SizeGuide } from "@/components/size-guide";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState("");
  const [added, setAdded] = useState(false);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetails(id),
  });
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "related"],
    queryFn: () => getProducts(),
  });

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setMainImage(product.image);
  }, [product]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center text-muted-foreground">
        Product laden...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <h1 className="font-serif text-4xl">Product niet gevonden</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Dit product staat niet actief in de Google Sheet of de Web App gaf geen product terug.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block border border-foreground px-6 py-3 text-xs uppercase tracking-widest"
        >
          Terug naar shop
        </Link>
      </div>
    );
  }

  const off =
    product.retail > product.price
      ? Math.round(((product.retail - product.price) / product.retail) * 100)
      : 0;
  const images = product.images?.length
    ? product.images
    : product.image
      ? [{ image_id: "main", url: product.image, thumbnail_url: product.image }]
      : [];
  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleAdd = () => {
    if (!size) return;
    add(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!size) return;
    add(product, size);
    navigate({ to: "/checkout" });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <nav className="mb-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop" className="hover:text-foreground">
          Shop
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <div className="relative bg-secondary">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                width={1024}
                height={1280}
                className="w-full object-cover"
                onError={() => {
                  const fallback = images.find((img) => img.thumbnail_url)?.thumbnail_url;
                  if (fallback && fallback !== mainImage) setMainImage(fallback);
                }}
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center px-8 text-center font-serif text-4xl text-muted-foreground">
                {product.name}
              </div>
            )}
            {off > 0 && (
              <span className="absolute left-4 top-4 bg-background px-3 py-1.5 text-[10px] uppercase tracking-widest">
                −{off}% Outlet
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {images.map((img) => (
                <button
                  key={img.image_id || img.url}
                  onClick={() => setMainImage(img.thumbnail_url || img.url)}
                  className={
                    "aspect-[4/5] overflow-hidden border bg-secondary " +
                    (mainImage === img.url || mainImage === img.thumbnail_url
                      ? "border-foreground"
                      : "border-border")
                  }
                >
                  <img
                    src={img.thumbnail_url || img.url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-28 md:self-start">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {product.brand}
          </div>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <div className="text-2xl">€{product.price.toFixed(2)}</div>
            {product.retail > product.price && (
              <div className="text-sm text-muted-foreground line-through">
                €{product.retail.toFixed(2)}
              </div>
            )}
            {product.retail > product.price && (
              <div className="text-xs uppercase tracking-widest text-[var(--color-gold)]">
                You save €{(product.retail - product.price).toFixed(2)}
              </div>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="eyebrow">Size</div>
              <SizeGuide category={product.category} />
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={
                    "min-w-12 border px-4 py-3 text-xs uppercase tracking-widest transition " +
                    (size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleAdd}
              disabled={!size || product.stock === 0}
              className="flex items-center justify-center gap-2 bg-foreground py-4 text-xs uppercase tracking-[0.22em] text-background transition hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to bag
                </>
              ) : product.stock === 0 ? (
                "Out of stock"
              ) : !size ? (
                "Select size"
              ) : (
                "Add to bag"
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!size || product.stock === 0}
              className="border border-foreground py-4 text-xs uppercase tracking-[0.22em] hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy now
            </button>
          </div>

          <ul className="mt-10 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" /> Authenticated by MA atelier
            </li>
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4" /> Free shipping over €200
            </li>
            <li className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4" /> 30-day returns
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-32">
          <h2 className="mb-10 font-serif text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {related.map((p: Product) => (
              <Link
                key={p.product_id || p.id}
                to="/product/$id"
                params={{ id: p.product_id || p.id }}
                className="group block"
              >
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
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
                    <div className="flex h-full items-center justify-center px-4 text-center font-serif text-xl text-muted-foreground">
                      {p.name}
                    </div>
                  )}
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {p.brand}
                </div>
                <div className="font-serif text-lg">{p.name}</div>
                <div className="text-sm">€{p.price.toFixed(2)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
