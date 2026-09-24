import api from "../../../services/api.js";
import { LOGIN, REGISTER } from "../../../services/endpoints.js";

function normalizeError(error, fallbackMessage) {
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  return new Error(apiMessage || fallbackMessage);
}

export async function login(email, password) {
  try {
    const response = await api.post(LOGIN, { email, password });
    if (response.status === 200) {
      return response.data;
    }
    throw new Error("Login failed");
  } catch (error) {
    throw normalizeError(error, "Login failed");
  }
};

export async function register(userData) {
  try {
    const response = await api.post(REGISTER, userData);
    if (response.status === 201 || response.status === 200) {
      return response.data;
    }
    throw new Error("Registration failed");
  } catch (error) {
    throw normalizeError(error, "Registration failed");
  }
};