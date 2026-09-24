import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile as updateProfileApi,
  resetMyPassword as resetMyPasswordApi,
  getUsers,
  deleteUser as deleteUserApi,
  changeUserRole as changeUserRoleApi,
  activateUser as activateUserApi,
  getUserLogs,
} from "../services/userApi.js";


export const useUser = (userQueryParams = null, logQueryParams = null) => {
  const queryClient = useQueryClient();

  // Fetch admin users list if params provided
  const usersQuery = useQuery({
    queryKey: ["adminUsers", userQueryParams],
    queryFn: () => getUsers(userQueryParams || {}),
    enabled: Boolean(userQueryParams),
  });

  // Fetch user logs if params provided
  const logsQuery = useQuery({
    queryKey: [QUERY_KEY_USER_LOGS, logQueryParams],
    queryFn: () => getUserLogs(logQueryParams || {}),
    enabled: Boolean(logQueryParams),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => updateProfileApi(profileData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["authUser"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (payload) => resetMyPasswordApi(payload),
  });

  // Admin: Change user role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => changeUserRoleApi(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_USERS });
    },
  });

  // Admin: Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: (userId) => activateUserApi(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_USERS });
    },
  });

  // Admin: Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => deleteUserApi(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_ADMIN_USERS });
    },
  });

  return {
    usersQuery,
    logsQuery,
    updateProfileMutation,
    resetPasswordMutation,
    changeRoleMutation,
    activateUserMutation,
    deleteUserMutation,
  };
};

export default useUser;
