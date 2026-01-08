// Shared Product types for the application

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  sizes: string[];
  inStock: boolean;
  featured: boolean;
  variant: 1 | 2 | 3;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}
