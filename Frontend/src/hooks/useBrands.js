import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBrands,
  createBrand as createBrandApi,
  deleteBrand as deleteBrandApi,
} from "../features/product/services/productApi.js";



export const useBrands = (params = null) => {
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: ["brands", params],
    queryFn: () => getBrands(params || {}),
    enabled: params !== false,
  });

  const createBrandMutation = useMutation({
    mutationFn: (payload) => createBrandApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (brandId) => deleteBrandApi(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  return {
    brandsQuery,
    createBrandMutation,
    deleteBrandMutation,
  };
};

export default useBrands;
