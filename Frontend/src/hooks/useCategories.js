import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory as createCategoryApi,
  deleteCategory as deleteCategoryApi,
} from "../features/product/services/productApi.js";



export const useCategories = (params = null) => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories", params],
    queryFn: () => getCategories(params || {}),
    enabled: params !== false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => createCategoryApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => deleteCategoryApi(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categoriesQuery,
    createCategoryMutation,
    deleteCategoryMutation,
  };
};

export default useCategories;
