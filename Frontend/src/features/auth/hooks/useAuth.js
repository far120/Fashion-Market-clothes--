import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi, register as registerApi } from "../services/authApi.js";
import { getProfile } from "../../User/services/userApi.js";



export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") || "";

  const {data: user = null, isLoading: isBootstrapping, refetch: refreshUser} = useQuery({
    queryKey: ["authUser"],
    queryFn: getProfile,
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: async (data) => {
      if (data?.token) {
        localStorage.setItem("token", data.token);
        await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData) => registerApi(userData),
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["authUser"], null);
    queryClient.removeQueries({ queryKey: ["authUser"] });
  };

  return {
    token,
    user,
    isBootstrapping: Boolean(token) && isBootstrapping,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
    loginMutation,
    registerMutation,
    logout,
    refreshUser,
  };
};

export default useAuth;