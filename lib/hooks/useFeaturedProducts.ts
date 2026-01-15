import { useQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface ProductsResponse {
  products: Product[];
}

export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: ["products", { featured: true, limit }],
    queryFn: async () => {
      const res = await fetch(`/api/products?limit=${limit}&sort=featured`);
      if (!res.ok) {
        throw new Error("Failed to fetch featured products");
      }
      const data: ProductsResponse = await res.json();
      return data.products;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - curated content
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
