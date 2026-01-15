import { useQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  category: string;
  categorySlug: string;
  inStock: boolean;
  featured: boolean;
}

interface ProductsResponse {
  products: Product[];
}

interface UseProductsOptions {
  category?: string;
  sort?: string;
  limit?: number;
  enabled?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    category = "all",
    sort = "featured",
    limit = 50,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ["products", { category, sort, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        category,
        sort,
        limit: limit.toString(),
      });
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data: ProductsResponse = await res.json();
      return data.products;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
