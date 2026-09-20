import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 120_000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data;
    let message = data?.error ?? error.message ?? "An unexpected error occurred";

    if (data?.details?.fieldErrors) {
      const fields = Object.values(data.details.fieldErrors).flat();
      if (fields.length > 0) message = String(fields[0]);
    }

    if (error.response?.status === 429 || message.toLowerCase().includes("rate limit")) {
      message = "Too many review requests. Please wait a moment and try again.";
    }

    if (error.code === "ERR_NETWORK") {
      message = "Network error. Check your connection and ensure the API server is running.";
    }

    return Promise.reject(new Error(message));
  },
);
