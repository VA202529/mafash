export type Product = {
  id: string;
  product_id?: string;
  name: string;
  brand: string;
  category: "Tops" | "Bottoms" | "Outerwear" | "Footwear" | "Accessories" | string;
  price: number;
  retail: number;
  image: string;
  image_url?: string;
  images?: Array<{
    image_id?: string;
    url: string;
    thumbnail_url?: string;
    drive_file_id?: string;
  }>;
  sizes: string[];
  variants?: Array<{
    variant_id?: string;
    size: string;
    stock: number;
    availability_status?: "in_stock" | "on_request" | string;
    availability_label?: string;
    sort_order?: number;
    active?: boolean;
  }>;
  description: string;
  stock?: number;
  availability_status?: "in_stock" | "on_request" | string;
  availability_label?: string;
  sku?: string;
  discount_type?: "none" | "percent" | "fixed" | string;
  discount_value?: number;
  featured?: boolean;
  schedule_state?: string;
  visible_from?: string;
  visible_until?: string;
  launch_badge_text?: string;
  scheduled_action?: Record<string, unknown> | null;
};

export const products: Product[] = [];
