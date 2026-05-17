import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products, type Product } from "@/data/products";

export type CartItem = {
  productId: string;
  size: string;
  qty: number;
  product?: Product;
};

type CartCtx = {
  items: CartItem[];
  add: (product: Product, size: string, qty?: number) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: Array<CartItem & { product: Product }>;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ma-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      localStorage.removeItem(KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (product, size, qty = 1) => {
    setItems((prev) => {
      const productId = product.product_id || product.id;
      const i = prev.findIndex((x) => x.productId === productId && x.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], productId, product, qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { productId, product, size, qty }];
    });
  };

  const remove: CartCtx["remove"] = (productId, size) =>
    setItems((prev) => prev.filter((x) => !(x.productId === productId && x.size === size)));

  const setQty: CartCtx["setQty"] = (productId, size, qty) =>
    setItems((prev) =>
      prev
        .map((x) => (x.productId === productId && x.size === size ? { ...x, qty } : x))
        .filter((x) => x.qty > 0),
    );

  const clear = () => setItems([]);

  const detailed = items
    .map((it) => {
      const product =
        it.product || products.find((p) => p.id === it.productId || p.product_id === it.productId);
      return product ? { ...it, product } : null;
    })
    .filter(Boolean) as Array<CartItem & { product: Product }>;

  const count = detailed.reduce((s, x) => s + x.qty, 0);
  const subtotal = detailed.reduce((s, x) => s + x.qty * x.product.price, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal, detailed }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
