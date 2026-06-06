import type { Product } from "@/data/products";

export const API_BASE =
  "https://script.google.com/macros/s/AKfycbynWfli1fSbNHx_29-G104VRmNzj0_yye3uN3gt-O0XjSju2C_OgLUb782APovi3_A/exec";

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

export type AddressLookupResult = {
  found: boolean;
  street?: string;
  city?: string;
  postal_code?: string;
};

export type ProofReview = {
  proof_id: string;
  image_url: string;
  thumbnail_url?: string;
  customer_name?: string;
  link_url?: string;
  product_name?: string;
  badge_text?: string;
  quote?: string;
  review_date?: string;
};

export type CustomerReview = {
  review_id: string;
  name: string;
  rating: number;
  message: string;
  created_at?: string;
};

export type CreateCustomerReviewPayload = {
  name: string;
  email: string;
  rating: number;
  message: string;
};

export type ScheduledAction = {
  action_id: string;
  name: string;
  action_type: string;
  discount_type?: string;
  discount_value?: number;
  frontend_text?: string;
  ends_at?: string;
};

export type CollectionDrop = {
  collection_id: string;
  name: string;
  description?: string;
  badge_text?: string;
  start_at?: string;
  end_at?: string;
  schedule_state?: string;
  product_ids?: string[];
};

export type ProductPageResult = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  page_count: number;
  has_next: boolean;
  has_previous: boolean;
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
  const variants = Array.isArray(raw.variants)
    ? raw.variants
        .map((variant) => {
          const row = variant as Record<string, unknown>;
          const stock = Math.max(0, Number(row.stock || 0));
          const availabilityStatus = String(
            row.availability_status || (stock > 0 ? "in_stock" : "on_request"),
          );
          return {
            variant_id: String(row.variant_id || ""),
            size: String(row.size || "").trim(),
            stock,
            availability_status: availabilityStatus,
            availability_label: String(
              row.availability_label ||
                (availabilityStatus === "in_stock" ? "Op voorraad" : "Op aanvraag"),
            ),
            sort_order: Number(row.sort_order || 0),
            active: row.active !== false && String(row.active).toLowerCase() !== "false",
          };
        })
        .filter((variant) => variant.size && variant.active)
    : [];
  const sizes = variants.length ? variants.map((variant) => variant.size) : splitList(raw.sizes);
  const variantStock = variants.reduce((total, variant) => total + variant.stock, 0);
  const stock = variants.length ? variantStock : Number(raw.stock || 0);
  const availabilityStatus = String(
    raw.availability_status || (stock > 0 ? "in_stock" : "on_request"),
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
    sizes: sizes.length ? sizes : ["One Size"],
    variants,
    description: String(raw.description || ""),
    stock,
    availability_status: availabilityStatus,
    availability_label: String(
      raw.availability_label || (availabilityStatus === "in_stock" ? "Op voorraad" : "Op aanvraag"),
    ),
    sku: String(raw.sku || ""),
    discount_type: String(raw.discount_type || "none"),
    discount_value: Number(raw.discount_value || 0),
    featured: raw.featured === true || String(raw.featured).toLowerCase() === "true",
    schedule_state: String(raw.schedule_state || "live"),
    visible_from: String(raw.visible_from || ""),
    visible_until: String(raw.visible_until || ""),
    launch_badge_text: String(raw.launch_badge_text || ""),
    scheduled_action:
      raw.scheduled_action && typeof raw.scheduled_action === "object"
        ? (raw.scheduled_action as Record<string, unknown>)
        : null,
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
  filters: {
    category?: string;
    brand?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {},
) {
  try {
    const data = await request<Array<Record<string, unknown>>>("getProducts", filters);
    return data.map(normalizeProduct);
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function getProductsPage(
  filters: {
    category?: string;
    brand?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  } = {},
): Promise<ProductPageResult> {
  const data = await request<{
    items: Array<Record<string, unknown>>;
    total: number;
    page: number;
    limit: number;
    page_count: number;
    has_next: boolean;
    has_previous: boolean;
  }>("getProductsPage", filters);
  return {
    ...data,
    items: (data.items || []).map(normalizeProduct),
    total: Number(data.total || 0),
    page: Number(data.page || 1),
    limit: Number(data.limit || filters.limit || 12),
    page_count: Number(data.page_count || 1),
    has_next: Boolean(data.has_next),
    has_previous: Boolean(data.has_previous),
  };
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

export async function getProofReviews() {
  try {
    return await request<ProofReview[]>("getProofReviews");
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function getCustomerReviews() {
  try {
    return await request<CustomerReview[]>("getCustomerReviewsPublic");
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function createCustomerReview(payload: CreateCustomerReviewPayload) {
  return request<{ review_id: string; status: string }>("createCustomerReview", payload);
}

export async function getActiveScheduledActions() {
  try {
    return await request<ScheduledAction[]>("getActiveScheduledActionsPublic");
  } catch (error) {
    console.warn(error);
    return [];
  }
}

export async function getCollections() {
  try {
    return await request<CollectionDrop[]>("getCollectionsPublic");
  } catch (error) {
    console.warn(error);
    return [];
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

export async function lookupAddress(postalCode: string, houseNumber: string) {
  return request<AddressLookupResult>("lookupAddress", {
    postal_code: postalCode,
    house_number: houseNumber,
  });
}
