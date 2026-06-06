import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag } from "lucide-react";
import { getCompany } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { privateSellerDisclaimer } from "@/lib/disclaimer";

export function SiteHeader() {
  const { count } = useCart();
  const { data: company } = useQuery({ queryKey: ["company"], queryFn: getCompany });
  const announcement =
    company?.announcement_bar ||
    "Authenticated luxury & contemporary essentials, at outlet pricing · Shipped globally from France";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.18em] md:flex">
          <Link
            to="/shop"
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Shop
          </Link>
          <Link
            to="/shop"
            search={{ category: "Outerwear" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Outerwear
          </Link>
          <Link
            to="/shop"
            search={{ category: "Footwear" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Footwear
          </Link>
          <Link to="/authenticity" className="text-muted-foreground hover:text-foreground">
            Authenticity
          </Link>
        </nav>
        <Link to="/" className="font-serif text-2xl tracking-[0.3em]">
          MA<span className="text-[var(--color-gold)]">·</span>FASHION
        </Link>
        <div className="flex items-center gap-5 text-foreground">
          <Link to="/shop" aria-label="Search" className="hidden md:block hover:opacity-60">
            <Search className="h-4 w-4" />
          </Link>
          <Link to="/cart" className="relative flex items-center gap-2 hover:opacity-60">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.18em]">Bag</span>
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="border-t border-border bg-foreground py-2 text-center text-[10px] uppercase tracking-[0.32em] text-background">
        {announcement}
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { data: company } = useQuery({ queryKey: ["company"], queryFn: getCompany });
  const footerText =
    company?.footer_text ||
    "Authenticated luxury & contemporary essentials, at outlet pricing. Shipped globally from France.";
  const creditText = company?.credit_text || "Website ontwikkeld door Van Appiah";
  const creditLabel = company?.credit_label || "VA";
  const creditUrl = company?.credit_url || "https://vanappiah.com/";

  return (
    <footer className="mt-32 border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-serif text-xl tracking-[0.3em]">MA·FASHION</div>
          <p className="mt-4 text-sm text-muted-foreground">{footerText}</p>
          <div className="mt-6 border-t border-border pt-4">
            <div className="eyebrow mb-3">Disclaimer</div>
            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              {privateSellerDisclaimer.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="eyebrow mb-4">Shop</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/shop">All Products</Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "Tops" }}>
                Tops
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "Bottoms" }}>
                Bottoms
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "Outerwear" }}>
                Outerwear
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "Footwear" }}>
                Footwear
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Care</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/returns">Shipping & Returns</Link>
            </li>
            <li>
              <Link to="/authenticity">Authenticity</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Newsletter</div>
          <p className="mb-3 text-sm text-muted-foreground">First access to new drops.</p>
          <form className="flex border border-foreground">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button className="bg-foreground px-4 text-xs uppercase tracking-widest text-background">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} MA Fashion. All rights reserved.</div>
          <div>
            {creditText}{" "}
            <a
              href={creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              {creditLabel}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
