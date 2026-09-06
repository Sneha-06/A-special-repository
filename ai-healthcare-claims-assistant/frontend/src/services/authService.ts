import type { AuthUser } from "../types";
import { api } from "./api";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: AuthUser }>("/auth/me");
  return data.user;
}
