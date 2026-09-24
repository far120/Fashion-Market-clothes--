import api from "../../../services/api.js";
import {
    ACTIVATE_USER,
    CHANGE_USER_ROLE,
    DELETE_USER,
    GET_PROFILE,
    GET_USER_LOGS,
    GET_USERS,
    RESET_MY_PASSWORD,
    UPDATE_PROFILE,
} from "../../../services/endpoints.js";

function normalizeError(error, fallbackMessage) {
    const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

    return new Error(apiMessage || fallbackMessage);
}


export async function getProfile() {
    try {
        const response = await api.get(GET_PROFILE);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error("Failed to fetch profile");
    } catch (error) {
        throw normalizeError(error, "Failed to fetch profile");
    }
}

export async function updateProfile(profileData) {
    try {
    const response = await api.put(UPDATE_PROFILE, profileData);
    if (response.status === 200) {
            return response.data;
    }
    throw new Error("Failed to update profile");
    } catch (error) {
        throw normalizeError(error, "Failed to update profile");
    }
}

export async function resetMyPassword(payload) {
    try {
        const response = await api.put(RESET_MY_PASSWORD, payload);
        return response.data;
    } catch (error) {
        throw normalizeError(error, "Failed to reset password");
    }
}

export async function getUsers(params = {}) {
    try {
        const response = await api.get(GET_USERS, { params });
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        throw normalizeError(error, "Failed to fetch users");
    }
}

function normalizePaginatedResponse(data) {
  if (!data) {
    return {
      page: 1,
      totalPages: 1,
      totalResults: 0,
      result: [],
    };
  }

  // Handle Backend response format: { data: [...], page, limit, totalPages, totalResults }
  if (Array.isArray(data.data)) {
    return {
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: data.totalPages || 1,
      totalResults: data.totalResults || 0,
      result: data.data,
    };
  }

  if (Array.isArray(data.result)) {
    return data;
  }

  if (Array.isArray(data.results)) {
    return {
      ...data,
      result: data.results,
    };
  }

  // Handle array responses
  if (Array.isArray(data)) {
    return {
      page: 1,
      totalPages: 1,
      totalResults: data.length,
      result: data,
    };
  }

  return {
    page: data.page || 1,
    totalPages: data.totalPages || 1,
    totalResults: data.totalResults || 0,
    result: [],
  };
}

export async function deleteUser(userId) {
    try {
        const response = await api.delete(DELETE_USER(userId));
        return response.data;
    } catch (error) {
        throw normalizeError(error, "Failed to delete user");
    }
}

export async function changeUserRole(userId, role) {
    try {
        const response = await api.patch(CHANGE_USER_ROLE(userId), { role });
        return response.data;
    } catch (error) {
        throw normalizeError(error, "Failed to change user role");
    }
}

export async function activateUser(userId) {
    try {
        const response = await api.patch(ACTIVATE_USER(userId));
        return response.data;
    } catch (error) {
        throw normalizeError(error, "Failed to activate user");
    }
}

export async function getUserLogs(params) {
    try {
        const response = await api.get(GET_USER_LOGS, { params });
        return normalizePaginatedResponse(response.data);
    } catch (error) {
        throw normalizeError(error, "Failed to fetch user logs");
    }
}

