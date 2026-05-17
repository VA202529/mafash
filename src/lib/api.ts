import type { Product } from "@/data/products";

export const API_BASE =
  "https://script.google.com/macros/s/AKfycbyiQvbymRAMknw96eZ8r7rtFIK2UyMyLg-7nEme9QgSOEoGbaUXucOEtns6TwJHOHBC/exec";

type ApiEnvelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { message: string; code?: number } };

export type CompanySettings = {
  website_name?: string;
  company_name?: string;
  brand_name?: string;
  tagline?: string;
  announcement_bar?: string;
  footer_text?: string;
  email_1?: string;
  phone_1?: string;
  shipping_cost?: string | number;
  free_shipping_above?: string | number;
  credit_text?: string;
  credit_url?: string;
  credit_label?: string;
};

export type CreateOrderPayload = {
  customer_name: string;
  email: string;
  phone: string;
  delivery_type: "verzenden" | "ophalen";
  address?: string;
  customer_city?: string;
  customer_postal_code?: string;
  customer_country?: string;
  coupon_code?: string;
  notes?: string;
  items: Array<{ product_id: string; quantity: number; size?: string }>;
};

function splitList(value: unknown) {
  if (Array.isArray(value))
    return value
      .map(String)
      .map((x) => x.trim())
      .filter(Boolean);
  return String(value || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function normalizeProduct(raw: Partial<Product> & Record<string, unknown>): Product {
  const id = String(raw.product_id || raw.id || "");
  const price = Number(raw.price || raw.sell_price || raw.price_inc_vat || 0);
  const retail = Number(
    raw.retail ||
      raw.retail_price ||
      raw.original_price ||
      raw.sell_price ||
      raw.price_inc_vat ||
      price,
  );
  const images = Array.isArray(raw.images) ? (raw.images as Product["images"]) : [];
  const image = String(
    images?.[0]?.thumbnail_url || images?.[0]?.url || raw.image || raw.image_url || "",
  );

  return {
    id,
    product_id: String(raw.product_id || id),
    name: String(raw.name || "Product"),
    brand: String(raw.brand || "MA Fashion"),
    category: String(raw.category || "Tops"),
    price,
    retail: retail || price,
    image,
    image_url: image,
    images,
    sizes: splitList(raw.sizes).length ? splitList(raw.sizes) : ["One Size"],
    description: String(raw.description || ""),
    stock: Number(raw.stock || 0),
    sku: String(raw.sku || ""),
    discount_type: String(raw.discount_type || "none"),
    discount_value: Number(raw.discount_value || 0),
    featured: raw.featured === true || String(raw.featured).toLowerCase() === "true",
  };
}

async function request<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...data }),
  });
  const json = (await response.json()) as ApiEnvelope<T>;
  if (!json.success) throw new Error(json.error?.message || "API request failed.");
  return json.data;
}

export async function getProducts(
  filters: { category?: string; brand?: string; featured?: boolean } = {},
) {
  try {
    const data = await request<Array<Record<string, unknown>>>("getProducts", filters);
    return data.map(normalizeProduct);
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function getProductDetails(productId: string) {
  try {
    const data = await request<Record<string, unknown>>("getProductDetails", {
      product_id: productId,
    });
    return normalizeProduct(data);
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export async function getCompany() {
  try {
    return await request<CompanySettings>("company");
  } catch (error) {
    console.warn(error);
    return {
      website_name: "MA Fashion",
      announcement_bar:
        "Authenticated luxury & contemporary essentials, at outlet pricing - Shipped globally from France",
      footer_text:
        "Authenticated luxury & contemporary essentials, at outlet pricing. Shipped globally from France.",
      credit_text: "Website ontwikkeld door Van Appiah",
      credit_url: "https://vanappiah.com/",
      credit_label: "VA",
    };
  }
}

export async function createOrder(payload: CreateOrderPayload) {
  return request<{
    order_id: string;
    total_price: number;
    payment_status: string;
    fulfillment_status: string;
  }>("createOrder", payload);
}
