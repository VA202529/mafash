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
  description: string;
  stock?: number;
  sku?: string;
  discount_type?: "none" | "percent" | "fixed" | string;
  discount_value?: number;
  featured?: boolean;
};

export const products: Product[] = [];
