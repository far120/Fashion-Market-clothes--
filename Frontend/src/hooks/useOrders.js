import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  createOrder as createOrderApi,
  updateOrder as updateOrderApi,
} from "../features/product/services/productApi.js";



export const useOrders = (params = null) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params || {}),
    enabled: params !== false,
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload) => createOrderApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, payload }) => updateOrderApi(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    ordersQuery,
    createOrderMutation,
    updateOrderMutation,
  };
};

export default useOrders;
