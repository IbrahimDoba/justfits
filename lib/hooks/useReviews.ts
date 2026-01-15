import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

interface ReviewsResponse {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  ratingDistribution: number[];
}

export function useReviews(productSlug: string) {
  return useQuery({
    queryKey: ["reviews", productSlug],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productSlug}/reviews`);
      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data: ReviewsResponse = await res.json();
      return data;
    },
    enabled: !!productSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes - user-generated content
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface AddReviewData {
  rating: number;
  title?: string;
  comment: string;
}

export function useAddReview(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddReviewData) => {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to add review");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate reviews to refetch latest data
      queryClient.invalidateQueries({ queryKey: ["reviews", productSlug] });
      queryClient.invalidateQueries({ queryKey: ["product", productSlug] });
    },
  });
}

export function useDeleteReview(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(
        `/api/products/${productSlug}/reviews/${reviewId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete review");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate reviews to refetch latest data
      queryClient.invalidateQueries({ queryKey: ["reviews", productSlug] });
      queryClient.invalidateQueries({ queryKey: ["product", productSlug] });
    },
  });
}
