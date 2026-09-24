import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
} from "../features/product/services/productApi.js";



export const useProducts = (params = null, productId = null) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params || {}),
    enabled: params !== false,
  });

  const productDetailQuery = useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => getProductById(productId),
    enabled: Boolean(productId),
  });

  const createProductMutation = useMutation({
    mutationFn: (payload) => createProductApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, payload }) => updateProductApi(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) => deleteProductApi(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    productsQuery,
    productDetailQuery,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
};

export default useProducts;
