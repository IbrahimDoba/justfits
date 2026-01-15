import { useQuery } from "@tanstack/react-query";

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  category: string;
  categorySlug: string;
  sizes: string[];
  inStock: boolean;
  featured: boolean;
  variants: ProductVariant[];
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  ratingDistribution: number[];
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category: string;
  inStock: boolean;
}

interface ProductResponse {
  product: Product;
  relatedProducts: RelatedProduct[];
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Product not found");
        }
        throw new Error("Failed to fetch product");
      }
      const data: ProductResponse = await res.json();
      return data;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
