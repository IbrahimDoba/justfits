import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
  search?: string;
  enabled?: boolean;
  // Server-rendered list for these exact options (skips the first fetch).
  initialData?: Product[];
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    category = "all",
    sort = "featured",
    limit = 50,
    search = "",
    enabled = true,
    initialData,
  } = options;

  return useQuery({
    queryKey: ["products", { category, sort, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams({
        category,
        sort,
        limit: limit.toString(),
      });
      if (search) params.set("search", search);
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data: ProductsResponse = await res.json();
      return data.products;
    },
    enabled,
    initialData,
    // Keep the current grid on screen while a new filter/sort loads.
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
