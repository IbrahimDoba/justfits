import { useQuery } from "@tanstack/react-query";

interface UserStats {
  orders: number;
  wishlist: number;
  reviews: number;
}

export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-stats", userId],
    queryFn: async () => {
      const res = await fetch("/api/user/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch user stats");
      }
      const data: UserStats = await res.json();
      return data;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - changes with user actions
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
