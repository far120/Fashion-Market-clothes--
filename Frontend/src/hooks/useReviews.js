import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReviews,
  createReview as createReviewApi,
  updateReview as updateReviewApi,
  deleteReview as deleteReviewApi,
} from "../features/product/services/productApi.js";



export const useReviews = (params = null) => {
  const queryClient = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", params],
    queryFn: () => getReviews(params || {}),
    enabled: params !== false,
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload) => createReviewApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, payload }) => updateReviewApi(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReviewApi(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return {
    reviewsQuery,
    createReviewMutation,
    updateReviewMutation,
    deleteReviewMutation,
  };
};

export default useReviews;
