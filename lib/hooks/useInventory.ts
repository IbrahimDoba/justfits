import { useQuery } from "@tanstack/react-query";

export interface InventoryListItem {
  id: string;
  name: string;
  brand: string | null;
  category: "CAP" | "SHIRT" | "OTHER";
  size: string | null;
  sku: string | null;
  imageUrl: string | null;
  costPrice: number | null;
  sellingPrice: number | null;
  quantity: number;
  notes: string | null;
  productId: string | null;
  isActive: boolean;
}

export const INVENTORY_QUERY_KEY = ["inventory"] as const;

// Cached inventory list. Served instantly from cache on revisit; refreshed in
// the background when stale, and invalidated by mutations (add/edit/delete/
// adjust/import) so it stays accurate.
export function useInventory() {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: async (): Promise<InventoryListItem[]> => {
      const res = await fetch("/api/admin/inventory");
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      return Array.isArray(data.items) ? data.items : [];
    },
    staleTime: 60 * 1000,
    refetchOnMount: true,
  });
}
