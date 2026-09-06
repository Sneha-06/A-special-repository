import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ahca_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    return axiosError.response?.data?.error ?? axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
